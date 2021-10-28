const express           = require("express"),
    router              = express.Router({mergeParams: true}),
    app                 = express(),
    Employee            = require("../models/employee"),
    User                = require("../models/user"),
    sanitizeHTML        = require("sanitize-html"),
    Territory           = require("../models/territory"),
    flash               = require("connect-flash"),
    Leaflet             = require("../models/leaflet"),
    methodOverride      = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))


router.get("/", isCompanyLoggedIn, function(req, res){
    Territory
        .find({company: req.user.company})
        .populate(["employee", "leaflet"])
        .exec(function(err, territories){
        if(err){
            console.log(err);
        } else {
            Employee.find({company: req.user._id}, function(err, employees){
                if(err){
                    console.log(err);
                } else {
                    console.log(territories)
                    res.render("./territories/index", {
                        currentUser: req.user, 
                        territories: territories, 
                        employees: employees, 
                        header: "Wszystkie tereny | Leaflet Manager", 
                        all: "" 
                    });
                }
            })
            
        }
    });
	
});

router.get("/available", isLoggedIn, function(req, res){
    Territory
        .find({ $and: [{company: req.user.company}, {type: 'free'}]})
        .populate(["employee", "leaflet"])
        .sort({lastWorked: -1})
        .exec(function(err, territories){
        if(err){
            console.log(err);
        } else {
            
            res.render("index", {
                currentUser: req.user, 
                territories: territories, 
                header: "Home | Leaflet Manager", 
                home: ""
            });
        }
    });
});

router.get("/new", isCompanyLoggedIn, function(req, res){
    Employee.find({company: req.user._id}, function(err, employees){
        if(err){
            console.log(err);
        } else {
            Leaflet.find({company: req.user._id}, (err, leaflets) => {
                res.render("./territories/new", { 
                    currentUser: req.user, 
                    employees: employees, 
                    header: "Dodaj teren | Leaflet Manager", 
                    leaflets: leaflets
                });
            })
            
        }
    })
	
});

router.post("/", isCompanyLoggedIn, function(req, res){
    
    
        let newTerritory = new Territory({
            city: sanitizeHTML(req.body.city), 
            street: sanitizeHTML(req.body.street), 
            lastWorked: req.body.lastP,
            beginNumber: req.body.beginNumber,
            endNumber: req.body.endNumber,
            taken: req.body.taken,
            description: sanitizeHTML(req.body.description),
            number: req.body.number,
            company: req.user.company
            
        });
        
        Territory.create(newTerritory, function(err, createdTerritory){
            if(err){
                console.log(err);
            } else {
                if(req.body.employee !== ""){
                    createdTerritory.employee = req.body.employee;
                } else {
                    createdTerritory.type="free";
                }
               
                if(req.body.leaflet !== ""){
                    createdTerritory.leaflet = req.body.leaflet;
                }
                createdTerritory.save();
                res.redirect("/territories/available");
            }
        })
    
});

router.get("/:territory_id/edit", isCompanyLoggedIn, function(req, res){
    Territory.findById(req.params.territory_id).populate(["employee", "leaflet"]).exec(function(err, territory){
        if(err){
            console.log(err);
        } else {
            Employee.find({company: req.user._id}, function(err, employees){
                if(err){
                    console.log(err);
                } else {
                    Leaflet.find({company: req.user._id}, (err, leaflets) => {
                        res.render("./territories/edit", { 
                            currentUser: req.user, 
                            territory: territory, 
                            employees: employees, 
                            leaflets: leaflets,
                            header: `Edytuj teren nr ${territory.number} firmy ${req.user.username} | Leaflet Manager`
                        });
                    })
                   
                }
            });
            
        }
    });
	
});

router.get("/:territory_id/share", isEmployeeLoggedIn, function(req, res){
    Territory.findById(req.params.territory_id).exec(function(err, territory){
        if(err){
            console.log(err);
        } else {
            Employee.findById(req.user.employee, (err, employee) => {
                territory.employee = employee._id;
                let date = new Date();
                let text = date.toDateString().toString();
                territory.taken = text;
                territory.type = undefined;
                territory.save();
                User.findOne({$and: [{company: req.user.company._id}, {type:'company'}]}, (err, company) => {
                    if(err){
                        console.log(err)
                    } else {
                        async function sendEmail(user, company, territory) {
                            const mailgun = require("mailgun-js");
                            const DOMAIN = 'websiteswithpassion.pl';
                            const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN, host: "api.eu.mailgun.net" });
                            const data = {
                                from: `Leaflet Manager <leafletmanager@websiteswithpassion.pl>`,
                                to: company.email,
                                subject: `Powiadomienie o zgłoszeniu się na teren`,
                                html: `<html>
                                        <head>
                                            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                                                integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                                            <link rel="stylesheet" type="text/css" href="./style.css">
                                        </head>
                                        <body>
                                            <p class="description">
                                                Witaj <em>${company.name}</em>,
                                                <br />
                                                Właśnie Twój pracownik ${user.name} zgłosił się na teren nr ${territory.number}.
                                                
                                                <br />
                                                Pozdrawiamy,
                                                <br />
                                                Leaflet Manager
                                                <br />
                                                <em>Wiadmość wygenerowana automatycznie. Nie odpowiadaj na nią</em>
                                            </p>
                                        </body>
                                    </html>`
                            };
                            mg.messages().send(data, function (error, body) {
                                if (error) {
                                    console.log(error)
                                }
                            });
                        }
                        sendEmail(employee, company, territory)
                        res.redirect(`/employees/${req.user._id}/dashboard`);
                    }
                })
                
            })
          
            
        }
    });
	
});

router.put("/:territory_id", isCompanyLoggedIn, function(req, res){
    
    Territory.findById(req.params.territory_id, function(err, territory){
        if(err){
            console.log(err);
        } else {
            territory.city = sanitizeHTML(req.body.territory.city);
            territory.street = sanitizeHTML(req.body.territory.street);
            territory.number = req.body.territory.number;
            territory.description = sanitizeHTML(req.body.territory.description);
            territory.taken = req.body.territory.taken;
            territory.beginNumber = req.body.territory.beginNumber;
            territory.endNumber = req.body.territory.endNumber;
            territory.lastWorked = req.body.territory.lastWorked;
           
            if(req.body.territory.leaflet !== ""){
                territory.leaflet = req.body.territory.leaflet;
            }
            if(req.body.territory.employee === ""){
                territory.employee = undefined;
                territory.type = "free";
            } else {
                territory.employee = req.body.territory.employee;
                territory.type = undefined;
            }
            territory.save();
            res.redirect("/territories");
        }
    });
	
});

router.get("/:territory_id/delete/confirm", isCompanyLoggedIn, function(req, res){
    Territory.findById(req.params.territory_id, function(err, territory){
        if(err){
            console.log(err);
        } else {
            res.render("./territories/confirm", {
                territory: territory,
                currentUser: req.user,
                header: `Potwierdzenie usunięcia terenu | Leaflet Manager`
            });
        }
    });
});

router.delete("/:territory_id", isCompanyLoggedIn, function(req, res){
    Territory.findByIdAndDelete(req.params.territory_id, function(err, territory){
        if(err){
            console.log(err);
        } else {
            
            res.redirect("/territories");
        }
    });
	
});

router.get("/search", isCompanyLoggedIn, function(req, res){
    if(typeof req.query.city !== 'undefined'){
        const regex = new RegExp(escapeRegex(req.query.city), 'gi');
        Territory
            .find({$and: [{city: regex}, {company: req.user.company}]})
            .populate(["employee", "leaflet"])
            .exec(function(err, territories){
            if(err){
                console.log(err);
            } else {
                Employee.find({company: req.user._id}, function(err, employees){
                    if(err){
                        console.log(err);
                    } else {
                        res.render("./territories/search", {
                            param: req.query.city, 
                            territories: territories, 
                            currentUser: req.user, 
                            employees: employees,
                            header: "Wyszukiwanie terenów po miejscowości | Leaflet Manager"
                        });
                    }
                });
                
            }
        });
    } else if(typeof req.query.street !== 'undefined'){
        const regex = new RegExp(escapeRegex(req.query.street), 'gi');
        Territory
            .find({$and: [{street: regex}, {company: req.user.company}]})
            .populate(["employee", "leaflet"])
            .exec(function(err, territories){
            if(err){
                console.log(err);
            } else {
                Employee.find({company: req.user._id}, function(err, employees){
                    if(err){
                        console.log(err);
                    } else {
                        res.render("./territories/search", {
                            param: req.query.street, 
                            territories: territories, 
                            currentUser: req.user, 
                            employees: employees,
                            header: "Wyszukiwanie terenów po ulicy | Leaflet Manager"
                        });
                    }
                });
            }
        });
    } else if(typeof req.query.number !== 'undefined'){
        
        Territory
            .find({$and: [{number: req.query.number}, {company: req.user.company}]})
            .populate(["employee", "leaflet"])
            .exec(function(err, territories){
            if(err){
                console.log(err);
            } else {
                Employee.find({company: req.user._id}, function(err, employees){
                    if(err){
                        console.log(err);
                    } else {
                        res.render("./territories/search", {
                            param: req.query.number, 
                            territories: territories, 
                            currentUser: req.user, 
                            employees: employees,
                            header: "Wyszukiwanie terenów po nr terenu | Leaflet Manager"
                        });
                    }
                });
            }
        });
    } else if(typeof req.query.employee !== 'undefined'){
        
               
                Territory
                    .find({$and: [{employee: req.query.employee}, {company: req.user.company}]})
                    .populate(["employee", "leaflet"])
                    .exec(function(err, territories){
                    if(err){
                        console.log(err);
                    } else {
                        Employee.find({company: req.user._id}, function(err, employees){
                            if(err){
                                console.log(err);
                            } else {
                                
                                res.render("./territories/search", {
                                    param: req.query.mployee, 
                                    territories: territories,
                                    currentUser: req.user, 
                                    employees: employees,
                                    header: "Wyszukiwanie terenów po głosicielu | Leaflet Manager"
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
    res.redirect("/");
}
function isCompanyLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        if(req.user.type === 'company'){
            return next();
        }
        req.flash("error", "Do tej strony ma dostęp tylko administrator firmy");
        res.redirect("/companies/login");
    }
    req.flash("error", "Prosimy zaloguj się najpierw");
    res.redirect("/");
}

function isEmployeeLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        if(req.user.type === 'employee'){
            return next();
        }
        req.flash("error", "Do tej strony ma dostęp tylko zalogowany pracownik firmy");
        res.redirect("/employees/login");
    }
    req.flash("error", "Prosimy zaloguj się najpierw");
    res.redirect("/");
}
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;