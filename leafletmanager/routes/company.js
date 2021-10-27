const express           = require("express"),
    router              = express.Router({mergeParams: true}),
    app                 = express(),
    Company             = require("../models/company"),
    User                = require("../models/user"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    methodOverride      = require("method-override");




app.use(flash());
app.use(methodOverride("_method"))

router.get("/login", function(req, res){
	res.render("./companies/login", {
        header: "Logowanie jako firma | Leaflet Manager"
    });
});

router.get("/register", function(req, res){
	res.render("./companies/new", {
        header: "Zarejestruj firmę | Leaflet Manager"
    });
});
router.post("/login", function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            req.flash("error", "Zła nazwa użytkownika lub hasło");
            return res.redirect(`/companies/login`);
        }
        
            req.logIn(user, function (err) {
                console.log(user)
                if (err) { return next(err); }
                return res.redirect(`/territories/available`);
            });
        
      
    })(req, res, next);

});
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/companies/login");
});

router.post("/register", function(req, res){
    if(req.body.password !== req.body.confirm){
        req.flash("error", "Hasła nie są te same");
        res.render("./companies/new", { error:  "Hasła nie są te same", company: req.body});
    } else {
        let newCompany = new Company({
            name: req.body.name,
           
        });
        let newUser = new User({
            username: req.body.username,
            email: req.body.email,
            type: 'company'
        })
        User.register(newUser, req.body.password, function(err, user) {
            if(err) {
                
                return res.render("./companies/new", { error: err.message});
            } 
            Company.create(newCompany, (err, createdCompany) => {
                user.company = createdCompany._id;
                user.save()
                passport.authenticate("local")(req, res, function() {
                    req.flash("success", "Pomyślnie założono konto dla firmy " + createdCompany.name + " w Leaflet Manager")
                    res.redirect("/companies/login");
                });
            })
            
        });
    }
});

module.exports = router;