const express = require("express"),
    router              = express.Router({mergeParams: true}),
    app                 = express(),
    Congregation               = require("../models/congregation"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    methodOverride      = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))

router.get("/", function(req, res){
	res.redirect("/login");
});

router.get("/login", function(req, res){
	res.render("login", {
        header: "Logowanie | Territory Manager"
    });
});

router.get("/register", function(req, res){
	res.render("register", {
        header: "Rejestracja zboru | Territory Manager"
    });
});
router.post("/login", passport.authenticate("local", {
    successRedirect: "/territories/available",
    failureRedirect: "/login",
    failureFlash: true
}), function(req, res) {

});
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/login");
});

router.post("/register", function(req, res){
    if(req.body.password !== req.body.confirm){
        req.flash("error", "Hasła nie są te same");
        res.render("register", { error:  "Hasła nie są te same", congregation: req.body});
    } else {
        let newUser = new Congregation({
            username: req.body.username
        });
        Congregation.register(newUser, req.body.password, function(err, user) {
            if(err) {
                
                return res.render("register", { error: err.message});
            } 
            passport.authenticate("local")(req, res, function() {
                req.flash("success", "Pomyślnie założono konto dla zboru " + req.body.username + " w Territory Manager")
                res.redirect("/login");
            });
        });
    }
});

module.exports = router;