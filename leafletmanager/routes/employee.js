const express           = require("express"),
    router              = express.Router({mergeParams: true}),
    app                 = express(),
    Employee            = require("../models/employee"),
    User                = require("../models/user"),
    Territory           = require("../models/territory"),
    flash               = require("connect-flash"),
    passport            = require("passport"),
    methodOverride      = require("method-override");


   

app.use(flash());
app.use(methodOverride("_method"))

router.get("/", isCompanyLoggedIn, function(req, res){
    Employee.find({company: req.user._id}, function(err, employees){
        if(err){
            console.log(err);
        } else {
            res.render("./employees/index", { 
                currentUser: req.user, 
                employees: employees, 
                header: `Pracownicy firmy ${req.user.username} | Leaflet Manager`, 
                pre: ""  
            });
        }
    });
	
});

router.get("/:employee_id/dashboard", isEmployeeLoggedIn, (req, res) => {
    Territory.find({employee: req.params.employee_id}).populate(["employee", "company"]).exec((err, territories) => {
        if(err){
            console.log(err)
        } else {
            res.render('./employees/dashboard',
                {
                    header: `Tereny dla Ciebie przydzielone | Leaflet Manager`,
                    territories: territories,
                    currentUser: req.user,
                    dash: ""
                }
            )
        }
    })
})


router.get("/new", isCompanyLoggedIn, function(req, res){
	res.render("./employees/new", { 
        currentUser: req.user, 
        header: "Dodaj pracownika | Leaflet Manager", 
    });
});

router.post("/", isCompanyLoggedIn, function(req, res){
    if(req.body.password !== req.body.confirm){
        req.flash("error", "Hasła nie są te same");
        res.render("./employees/new", { error:  "Hasła nie są te same", employee: req.body});
    } else {
        let newEmployee = new Employee({
            name: req.body.name,
            company: req.user._id
        });
        let newUser = new User({
            username: req.body.username,
            email: req.body.email,
            company: req.user.company,
            type: 'employee'
        })
        User.register(newUser, req.body.password, function(err, user) {
            if(err) {
                
                return res.render("./employees/new", { header:"Dodaj pracownika | Leaflet Manager", error: err.message, currentUser: req.user});
            } 
            
           
            async function sendEmail(user, company) {
                const mailgun = require("mailgun-js");
                const DOMAIN = 'websiteswithpassion.pl';
                const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN, host: "api.eu.mailgun.net" });
                const data = {
                    from: `Leaflet Manager <leafletmanager@websiteswithpassion.pl>`,
                    to: user.email,
                    subject: `Powiadomienie o założeniu konta`,
                    html: `<html>
                            <head>
                                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                                    integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                                <link rel="stylesheet" type="text/css" href="./style.css">
                            </head>
                            <body>
                                <p class="description">
                                    Witaj <em>${user.name}</em>,
                                    <br />
                                    Właśnie firma ${company.company.name} założyła dla Ciebie konto w Leaflet Manager. Dzięki temu
                                    możesz zobaczyć swoje tereny ulotkowe w jednym miejscu oraz zgłosić się na jakieś wolne.
                                    Poniżej dane do logowania i link
                                    <br />
                                    Nazwa użytkownika: <strong>${user.username}</strong>
                                    <br />
                                    Hasło: <strong>${req.body.password}</strong>
                                    <br />
                                    <a href=https://${req.headers.host}/employees/>Zaloguj się tutaj</a>
                                    <br />
                                    Pozdrawiamy,
                                    <br />
                                    Leaflet Manager

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
            sendEmail(user, req.user)
           
            Employee.create(newEmployee, (err, createdEmployee) => {
                if(err){
                    console.log(err)
                } else {
                    user.employee = createdEmployee._id;
                    user.save();
                    req.flash("success", "Pomyślnie założono konto dla użytkownika " + req.body.name + " w Leaflet Manager")
                    res.redirect("/employees");
                }
            })
                
                
           
        });
    }
   
});
router.get("/login", function(req, res){
	res.render("./employees/login", {
        header: "Logowanie jako użytkownik | Leaflet Manager"
    });
});


router.post("/login", function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            req.flash("error", "Zła nazwa użytkownika lub hasło");
            return res.redirect(`/employees/login`);
        }
        
            req.logIn(user, function(err) {
                console.log(user)
                if (err) { return next(err); }
                return res.redirect(`/employees/${user.employee}/dashboard`);
            });
        
      
    })(req, res, next);

});
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/employees/login");
});



router.get("/:employee_id/edit", isLoggedIn, function(req, res){
    Employee.findById(req.params.employee_id, function(err, employee){
        if(err){
            console.log(err);
        } else {
            res.render("./employees/edit", { 
                currentUser: req.user, 
                employee: employee, 
                header: `Edytuj pracownika w firmie ${req.user.username} | Leaflet Manager`
            });
        }
    });
});

router.put("/:employee_id", isCompanyLoggedIn, function(req, res){
    Employee.findByIdAndUpdate(req.params.employee_id, req.body.employee, function(err, employee){
        if(err){
            console.log(err);
        } else {
            employee.name = req.body.employee.name;
            employee.save();
            res.redirect("/employees");
        }
    });
});

router.get("/:employee_id/delete/confirm", isCompanyLoggedIn, function(req, res){
    Employee.findById(req.params.employee_id, function(err, employee){
        if(err){
            console.log(err);
        } else {
            res.render("./employees/confirm", {
                employee: employee,
                currentUser: req.user,
                header: `Potwierdzenie usunięcia pracownika | Leaflet Manager`
            });
        }
    });
});

router.delete("/:employee_id", isCompanyLoggedIn, function(req, res){
    Employee.findByIdAndDelete(req.params.employee_id, function(err, employee){
        if(err){
            console.log(err);
        } else {
            User.findOne({employee: employee._id}, (err,user) => {
                user.delete();
                Territory.find({employee: employee._id}, (err, territories) => {
                    territories.forEach((territory) => {
                        let date = new Date();
                        let text = date.toDateString().toString();
                        territory.lastWorked = text;
                        territory.type = "free";
                        territory.employee = undefined;
                        territory.save();
                    })
                    res.redirect("/employees");
                })
            })
            
        }
    });
});

router.get("/search", isCompanyLoggedIn, function(req, res){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Employee.find({$and: [{name: regex}, {employee: req.user._id}]}, function(err, employees){
        if(err){
            console.log(err);
        } else {
            console.log(regex)
            res.render("./employees/search", {
                param: req.query.search, 
                employees: employees, 
                currentUser: req.user,
                header: "Szukaj pracowników | Leaflet Manager"
            });
        }
    });
});

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