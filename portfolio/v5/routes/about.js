const express = require("express"),
	   Achievement          = require("../models/achievement"),
    User = require("../models/user"),
    app = express(),
    methodOverride = require("method-override"),
    i18n = require("i18n"),
    flash = require("connect-flash"),
    router = express.Router();


app.use(flash());
app.use(methodOverride("_method"));

router.get("/", function(req, res){
    let username = "Admin";
    User.findOne({username: username}).populate("achievements").exec(function(err, user){
        if(err){
            console.log(err);
        } else {
            i18n.setLocale(req.language);
            console.log(user.achievements)
			let header = "O mnie | Portfolio | Maciej Kuta";
            res.render("./user/show", {currentUser: req.user, user:user, lang: req.language, header: header, about:""});
        }
    });
   
});


router.get("/:id/edit", isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, user){
        if(err) {
            console.log(err);
        } else {
            let header = `Edytuj użytkownika ${user.username} | Portfolio | Maciej Kuta`;
            res.render("./user/edit", {user: user, header: header});
        }
    });
});


router.put("/:id", isLoggedIn, function(req, res){
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
        if(err) {
            console.log(err);
        } else {
            res.redirect("/about");
        }
    });
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", i18n.__("Nie masz dostępu do tej strony"));
    res.redirect("/");
}

module.exports = router;