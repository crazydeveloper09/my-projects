const express = require("express"),
    User = require("../models/user"),
    app = express(),
    methodOverride = require("method-override"),
    async = require("async"),
    passport = require("passport"),
    flash = require("connect-flash"),
    router = express.Router();


app.use(flash());
app.use(methodOverride("_method"));

router.get("/", (req, res) => {
    let header = "Strona Główna | Noir Architekci";
    res.render("index", {header: header, currentUser: req.user});
})

router.get("/login", (req, res) => {
    let header = "Logowanie | Noir Architekci";
   res.render("login", {header: header});
});



router.post("/login", (req, res, next) =>  {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { 
           req.flash("error", "Zła nazwa użytkownika lub hasło");
            return res.redirect(`/login?return_route=${req.query.return_route}`); 
          }
        req.logIn(user, function(err) {
          if (err) { return next(err); }
          return res.redirect(req.query.return_route);
        });
      })(req, res, next);
});


router.get("/register", (req, res) => {
    let header = "Rejestracja | Noir Architekci";
    res.render("./user/new", {header: header});
});
router.post("/register", (req, res) => {
    let newUser = new User({
        username: req.body.username
    });
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            req.flash("error", err.message)
            let header = "Rejestracja | Noir Architekci";
            return res.render("./user/new", {user: req.body, error: err.message, header:header});
        } 
        passport.authenticate("local")(req, res, function() {
            req.flash("success", 'Witaj ' + req.body.username + ' na moim Noir Architekci');
            res.redirect("/login?return_route=/");
        });
    });
});

router.get("/logout", (req, res) =>  {
    req.logout();
    res.redirect("/");
});

router.post("/feedback", function(req, res, next){
    async.waterfall([
        function(done) {
            const mailgun = require("mailgun-js");
            const DOMAIN = 'websiteswithpassion.pl';
            const mg = mailgun({apiKey: process.env.API_MAILGUN, domain: DOMAIN, host:"api.eu.mailgun.net"});
            const data = {
                
                to: 'maciejkuta6@gmail.com',
                from: req.body.from,
                subject: req.body.topic,
                text: req.body.text + '\n\n' +
                'Dane kontaktowe: \n' + 
                'Imię i nazwisko: ' + req.body.name + '\n' +
                'Email: ' + req.body.from + '\n' +
                'Nr telefonu: ' +  req.body.phone
            };
            mg.messages().send(data, function (err, body) {
                req.flash("success", "Wysłano zapytanie do osoby kontaktowej");
                done(err, 'done');
            });
            
           
        }
    ], function(err){
        if(err) return next(err);
        res.redirect('/#footer');
    });
});

module.exports = router