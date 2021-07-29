const express           = require("express"),
    User                = require("../models/user"),
    Announcement        = require("../models/announcement"),
    flash               = require("connect-flash"),
    async               = require("async"),
    passport            = require("passport"),
    crypto              = require("crypto"),
    Base64              = require("js-base64"),
    atob                = require("atob"),
    btoa                = require("btoa"),
    app                 = express(),
    router              = express.Router();

app.use(flash());

router.get("/", (req, res) => {
    Announcement
        .find({})
        .populate(["author", "category"])
        .sort({added: -1})
        .limit(10)
        .exec((err, announcements) => {
        if(err){
            console.log(err)
        } else {
            let header = "Strona Główna | 5zeta";
            res.render("index",
                {
                    header: header, 
                    announcements: announcements,
                    logged: req.user
                }
            );
        }
    })
    
})

router.get("/policy", (req, res) => {
    let header = `Polityka prywatności i regulamin | 5zeta`;
    res.render("policy", {header: header});
})

router.get("/forgot", function(req, res){
    let header = `Poproś o zmianę hasła | 5zeta`;
    res.render("forgot", {header: header});
});

router.post("/forgot", function(req, res, next){
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                let token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done){
            let unhashedEmail = `${Base64.decode(req.body.email)}`;
            User.findOne({ email: unhashedEmail }, function(err, user){
                if(!user){
                    req.flash('error', 'Nie znaleźliśmy konta z takim emailem. Spróbuj ponownie');
                    return res.redirect("/forgot");
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 360000;
                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            const mailgun = require("mailgun-js");
			const DOMAIN = '5zeta.pl';
			const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN, host:"api.eu.mailgun.net"});
			const data = {
				from: 'Weryfikacja konta 5zeta.pl <verification@5zeta.pl>',
                to: `${Base64.decode(user.email)}`,
                subject: "Resetowanie hasła w portalu ogłoszeniowym 5zeta.pl",
                html: 'Otrzymujesz ten email, ponieważ ty (albo ktoś inny) zażądał zmianę hasła w portalu ogłoszeniowym 5zeta. \n\n' + 
                'Prosimy kliknij w poniższy link albo skopiuj go do paska przeglądarki, by dokończyć ten proces: \n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' + 
                'Jeśli to nie ty zażądałeś zmiany, prosimy zignoruj ten email, a twoje hasło nie zostanie zmienione. \n'
                
			};
			mg.messages().send(data, function (error, body) {
                req.flash("success", "Email został wysłany na adres " + atob(user.email) + " z dalszymi instrukcjami");
                
				console.log(error);
                done(error);
			});
            
        }
    ], function(err){
        if(err) return next(err);
        res.redirect('/forgot');
    });
});

router.get("/reset/:token", function(req, res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, user){
        if(!user) {
            req.flash("error", "Token wygasł lub jest niepoprawny");
            return res.redirect("/forgot");
        }
        let header = `Resetuj hasło | 5zeta`;
        res.render("reset", { token: req.params.token, header: header });
    });
});

router.post("/reset/:token", function(req, res){
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user){
                if(!user){
                    req.flash("error", "Token wygasł lub jest niepoprawny");
                    return res.redirect("back");
                }
                if(req.body.password === req.body.confirm){
                    user.setPassword(req.body.password, function(err){
                        user.resetPasswordExpires = undefined;
                        user.resetPasswordToken = undefined;
                        user.save(function(err){
                            req.logIn(user, function(err){
                                done(err, user);
                            });
                        });
                    });
                } else {
                    req.flash("error", "Hasła nie pasują do siebie");
                    return res.redirect("back");
                }
            });
        },
        function(user, done){
			const mailgun = require("mailgun-js");
			const DOMAIN = '5zeta.pl';
			const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN, host:"api.eu.mailgun.net"});
			const data = {
				from: 'Weryfikacja konta 5zeta.pl <verification@5zeta.pl>',
                to: atob(user.email),
                subject: "Potwierdzenie zmiany hasła w portalu ogłoszeniowym 5zeta",
                text: 'Witaj ' + user.username + ', \n\n' + 
                'To jest potwierdzenie, że twoje hasło zostało właśnie zmienione'
			};
			mg.messages().send(data, function (error, body) {
				req.flash("success", "Twoje hasło zostało zmienione pomyślnie");
				console.log(error);
                done(error, user);
			});
            
        }
    ], function(err, user){
        res.redirect(`/user/${user.username}/dashboard`);
    });
});

router.post("/login",function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            req.flash("error", "Zła nazwa użytkownika lub hasło");
            return res.redirect(`/login`);
        }
        if(user.verificated){
            req.logIn(user, function (err) {
                console.log(info)
                if (err) { return next(err); }
                return res.redirect(`/user/${user.username}/dashboard`);
            });
        } else {
            res.redirect(`/user/${user._id}/verification`)
        }
      
    })(req, res, next);
    
});
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
});
router.get("/login", function(req, res){
    let header = `Logowanie | 5zeta`;
	res.render("login", {header: header})
});




router.get("/support", function(req, res){
    let header = `Wsparcie | 5zeta`;
	res.render("support", {header: header})
});




router.get("/privacy-policy", function(req, res){
    let header = `Polityka prywatności | 5zeta`;
	res.render("privacy", {header: header, currentUser: req.user});
});



router.get("*", function(req, res){
    let header = `Strona nie istnieje | 5zeta`;
    res.render("error", {header: header, currentUser: req.user});
    
	
});






module.exports = router;