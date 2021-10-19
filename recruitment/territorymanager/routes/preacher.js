const express = require("express"),
    router              = express.Router({mergeParams: true}),
    app                 = express(),
    Preacher               = require("../models/preacher"),
    flash               = require("connect-flash"),
    methodOverride      = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))

router.get("/", isLoggedIn, function(req, res){
    Preacher.find({congregation: req.user._id}, function(err, preachers){
        if(err){
            console.log(err);
        } else {
            res.render("./preachers/index", { 
                currentUser: req.user, 
                preachers: preachers, 
                header: `Głosiciele zboru ${req.user.username} | Territory Manager`, 
                pre: ""  
            });
        }
    });
	
});



router.get("/new", isLoggedIn, function(req, res){
	res.render("./preachers/new", { 
        currentUser: req.user, 
        header: "Dodaj głosiciela | Territory Manager", 
        newP: "" 
    });
});

router.post("/", isLoggedIn, function(req, res){
    Preacher.create({name: req.body.name}, function(err, createdPreacher){
        if(err){
            console.log(err);
        } else {
            createdPreacher.congregation = req.user._id;
            createdPreacher.save();
            res.redirect("/preachers");
        }
    });
});

router.get("/:preacher_id/edit", isLoggedIn, function(req, res){
    Preacher.findById(req.params.preacher_id, function(err, preacher){
        if(err){
            console.log(err);
        } else {
            res.render("./preachers/edit", { 
                currentUser: req.user, 
                preacher: preacher, 
                header: `Edytuj głosiciela w zborze ${req.user.username} | Territory Manager`
            });
        }
    });
});

router.put("/:preacher_id", isLoggedIn, function(req, res){
    Preacher.findByIdAndUpdate(req.params.preacher_id, req.body.preacher, function(err, preacher){
        if(err){
            console.log(err);
        } else {
            preacher.name = req.body.preacher.name;
            preacher.save();
            res.redirect("/preachers");
        }
    });
});

router.get("/:preacher_id/delete", isLoggedIn, function(req, res){
    Preacher.findByIdAndDelete(req.params.preacher_id, function(err, preacher){
        if(err){
            console.log(err);
        } else {
            res.redirect("/preachers");
        }
    });
});

router.get("/search", isLoggedIn, function(req, res){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Preacher.find({$and: [{name: regex}, {congregation: req.user._id}]}, function(err, preachers){
        if(err){
            console.log(err);
        } else {
            console.log(regex)
            res.render("./preachers/search", {
                param: req.query.search, 
                preachers: preachers, 
                currentUser: req.user,
                header: "Szukaj głosicieli | Territory Manager"
            });
        }
    });
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Prosimy zaloguj się najpierw");
    res.redirect("/login");
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;