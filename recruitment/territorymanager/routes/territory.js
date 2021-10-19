const express = require("express"),
    router              = express.Router({mergeParams: true}),
    app                 = express(),
    Preacher               = require("../models/preacher"),
    Territory                = require("../models/territory"),
    flash               = require("connect-flash"),
    Base64                = require("js-base64"),
    methodOverride      = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))


router.get("/", isLoggedIn, function(req, res){
    Territory.find({congregation: req.user._id}).populate("preacher").exec(function(err, territories){
        if(err){
            console.log(err);
        } else {
            Preacher.find({congregation: req.user._id}, function(err, preachers){
                if(err){
                    console.log(err);
                } else {
                    res.render("./territories/index", {
                        currentUser: req.user, 
                        territories: territories, 
                        preachers: preachers, 
                        header: "Wszystkie tereny | Territory Manager", 
                        all: "" 
                    });
                }
            })
            
        }
    });
	
});

router.get("/available", isLoggedIn, function(req, res){
    Territory.find({ $and: [{congregation: req.user._id}, {type: 'free'}]}).populate("preacher").sort({lastWorked: -1}).exec(function(err, territories){
        if(err){
            console.log(err);
        } else {
           
            res.render("index", {
                currentUser: req.user, 
                territories: territories, 
                header: "Home | Territory Manager", 
                home: ""
            });
        }
    });
});

router.get("/new", isLoggedIn, function(req, res){
    Preacher.find({congregation: req.user._id}, function(err, preachers){
        if(err){
            console.log(err);
        } else {
            res.render("./territories/new", { 
                currentUser: req.user, 
                preachers: preachers, 
                header: "Dodaj teren | Territory Manager", 
                newT: "" 
            });
        }
    })
	
});

router.post("/", isLoggedIn, function(req, res){
    
    if(req.body.preacher === ""){
        let newTerritory = new Territory({
            city: req.body.city, 
            street: req.body.street, 
            lastWorked: req.body.lastP,
            beginNumber: req.body.beginNumber,
            endNumber: req.body.endNumber,
            taken: req.body.taken,
            description: req.body.description,
            forbidden: req.body.forbidden,
            number: req.body.number,
            congregation: req.user._id
        });
        console.log(newTerritory);
        Territory.create(newTerritory, function(err, createdTerritory){
            if(err){
                console.log(err);
            } else {
                
                createdTerritory.type="free";
                createdTerritory.save();
                res.redirect("/territories/available");
            }
        })
    } else {
        let newTerritory = new Territory({
            city: req.body.city, 
            street: req.body.street, 
            lastWorked: req.body.lastP,
            beginNumber: req.body.beginNumber,
            endNumber: req.body.endNumber,
            taken: req.body.taken,
            description: req.body.description,
            forbidden: req.body.forbidden,
            number: req.body.number,
            congregation: req.user._id
        });
        Preacher.findById(req.body.preacher, function(err, preacher){
            if(err){
                console.log(err);
            } else {
                Territory.create(newTerritory, function(err, createdTerritory){
                    if(err){
                        console.log(err);
                    } else {
                        createdTerritory.preacher = preacher._id;
                        createdTerritory.save();
                        res.redirect("/territories/available");
                    }
                })
            }
        });
    }
});

router.get("/:territory_id/edit", isLoggedIn, function(req, res){
    Territory.findById(req.params.territory_id).populate("preacher").exec(function(err, territory){
        if(err){
            console.log(err);
        } else {
            Preacher.find({congregation: req.user._id}, function(err, preachers){
                if(err){
                    console.log(err);
                } else {
                    res.render("./territories/edit", { 
                        currentUser: req.user, 
                        territory: territory, 
                        preachers: preachers, 
                        header: `Edytuj teren nr ${territory.number} zboru ${req.user.username} | Territory Manager`
                    });
                }
            });
            
        }
    });
	
});

router.put("/:territory_id", isLoggedIn, function(req, res){
    
    Territory.findById(req.params.territory_id, function(err, territory){
        if(err){
            console.log(err);
        } else {
            territory.city = req.body.territory.city;
            territory.street = req.body.territory.street;
            territory.number = req.body.territory.number;
            territory.description = req.body.territory.description;
            territory.taken = req.body.territory.taken;
            territory.beginNumber = req.body.territory.beginNumber;
            territory.endNumber = req.body.territory.endNumber;
            territory.lastWorked = req.body.territory.lastWorked;
            territory.forbidden = req.body.territory.forbidden;
            
            if(req.body.territory.preacher === ""){
                territory.preacher = undefined;
                territory.type = "free";
            } else {
                territory.preacher = req.body.territory.preacher;
                territory.type = undefined;
            }
            territory.save();
            res.redirect("/territories");
        }
    });
	
});

router.get("/:territory_id/delete", isLoggedIn, function(req, res){
    Territory.findByIdAndDelete(req.params.territory_id, function(err, territory){
        if(err){
            console.log(err);
        } else {
            
            res.redirect("/territories");
        }
    });
	
});

router.get("/search", isLoggedIn, function(req, res){
    if(typeof req.query.city !== 'undefined'){
        const regex = new RegExp(escapeRegex(req.query.city), 'gi');
        Territory.find({$and: [{city: regex}, {congregation: req.user._id}]}).populate("preacher").exec(function(err, territories){
            if(err){
                console.log(err);
            } else {
                Preacher.find({congregation: req.user._id}, function(err, preachers){
                    if(err){
                        console.log(err);
                    } else {
                        res.render("./territories/search", {
                            param: req.query.city, 
                            territories: territories, 
                            currentUser: req.user, 
                            preachers: preachers,
                            header: "Wyszukiwanie terenów po miejscowości | Territory Manager"
                        });
                    }
                });
                
            }
        });
    } else if(typeof req.query.street !== 'undefined'){
        const regex = new RegExp(escapeRegex(req.query.street), 'gi');
        Territory.find({$and: [{street: regex}, {congregation: req.user._id}]}).populate("preacher").exec(function(err, territories){
            if(err){
                console.log(err);
            } else {
                Preacher.find({congregation: req.user._id}, function(err, preachers){
                    if(err){
                        console.log(err);
                    } else {
                        res.render("./territories/search", {
                            param: req.query.street, 
                            territories: territories, 
                            currentUser: req.user, 
                            preachers: preachers,
                            header: "Wyszukiwanie terenów po ulicy | Territory Manager"
                        });
                    }
                });
            }
        });
    } else if(typeof req.query.number !== 'undefined'){
        
        Territory.find({$and: [{number: req.query.number}, {congregation: req.user._id}]}).populate("preacher").exec(function(err, territories){
            if(err){
                console.log(err);
            } else {
                Preacher.find({congregation: req.user._id}, function(err, preachers){
                    if(err){
                        console.log(err);
                    } else {
                        res.render("./territories/search", {
                            param: req.query.number, 
                            territories: territories, 
                            currentUser: req.user, 
                            preachers: preachers,
                            header: "Wyszukiwanie terenów po nr terenu | Territory Manager"
                        });
                    }
                });
            }
        });
    } else if(typeof req.query.preacher !== 'undefined'){
        Preacher.findOne({ $and: [{ congregation: req.user._id }, {_id: req.query.preacher}] }, function(err, preacher){
            if(err){
                console.log(err);
            } else {
               
                Territory.find({$and: [{preacher: preacher._id}, {congregation: req.user._id}]}).populate("preacher").exec(function(err, territories){
                    if(err){
                        console.log(err);
                    } else {
                        Preacher.find({congregation: req.user._id}, function(err, preachers){
                            if(err){
                                console.log(err);
                            } else {
                                
                                res.render("./territories/search", {
                                    param: preacher.name, 
                                    territories: territories,
                                    currentUser: req.user, 
                                    preachers: preachers,
                                    header: "Wyszukiwanie terenów po głosicielu | Territory Manager"
                                });
                            }
                        });
                    }
                });
            }
        });
    }
})


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