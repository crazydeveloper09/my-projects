const express = require("express"),
    Project = require("../models/project"),
    Announcement = require("../models/announcement"),
    User = require("../models/user"),
    passport = require("passport"),
    i18n = require("i18n"),
    router = express.Router();

router.get("/", (req, res) => {
    Project.find({}).sort({added: -1}).limit(3).exec(function(err, projects){
       if(err) {
           console.log(err);
       } else {
           i18n.setLocale(req.language);
           Announcement.find({}, function(err, announcements){
               if(err){
                   console.log(err);
               } else {
                let username = "Admin";
                User.findOne({username: username}).populate("achievements").exec(function(err, user){
                    let header = "Home | Portfolio | Maciej Kuta";
                    res.render("index", {currentUser: req.user, announcements:announcements, user: user, lang:req.language, projects: projects, header: header, home:""});
                });
                   
               }
           });
          
       }
   });
});

router.get("/login", (req, res) => {
    let header = "Logowanie | Portfolio | Maciej Kuta";
   res.render("login", {header: header});
});




router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}), (req, res) =>  {
   
});

router.get("/support", (req, res) => {
	res.redirect("https://www.buymeacoffee.com/crazydev");
});

router.get("/register", (req, res) => {
    i18n.setLocale(req.language);
    res.render("register");
});
router.post("/register", (req, res) => {
    let newUser = new User({
        username: req.body.username
    });
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            req.flash("error", err.message)
            return res.render("register", {user: req.body, error: err.message});
        } 
        passport.authenticate("local")(req, res, function() {
            req.flash("success", i18n.__('Witaj ') + req.body.username + i18n.__(' na moim portfolio'));
            res.redirect("/login");
        });
    });
});

router.get("/logout", (req, res) =>  {
    req.logout();
    res.redirect("/");
});

module.exports = router;