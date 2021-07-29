const express = require("express"),
    Project = require("../models/project"),
    Comment = require("../models/comment"),
    app = express(),
    methodOverride = require("method-override"),
    i18n = require("i18n"),
    flash = require("connect-flash"),
    router = express.Router({mergeParams:true});


app.use(flash());
app.use(methodOverride("_method"));

router.get("/new", function(req, res){
    Project.findOne({subpageLink: req.params.project_id}, function(err, project){
        if(err){
            console.log(err);
        } else {
            let header = `Dodaj opinię do projektu ${project.title} | Portfolio | Maciej Kuta`;
            i18n.setLocale(req.language);
            res.render("./reviews/new", { project:project, header: header, lang: req.language});
        }
    });
    
});
router.post("/", function(req, res){
    Project.findById(req.params.project_id, function(err, project){
        if(err){
            console.log(err);
        } else {    

            Comment.create({text: req.body.text}, function(err, review){
                if(err){
                    console.log(err);
                } else {
                    console.log(req.body);
                    review.author = req.body.username;
                    review.project = project._id;
                    review.stars = req.body.stars;
                    review.save();
                    project.reviews.push(review);
                    project.save();
                    res.redirect("/projects/" + project.subpageLink);
                }
            });
        }
    });
});





router.get("/:review_id/delete", isLoggedIn, function(req, res){
    Project.findById(req.params.project_id, function(err, project){
        if(err){
            console.log(err);
        } else {
            Comment.findByIdAndDelete(req.params.review_id, function(err, review){
                if(err) {
                    console.log(err);
                } else {
                    res.redirect("/projects/" + project._id);
                }
            });
            
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