
const express           = require("express"),
    router              = express.Router(),
    passport            = require("passport"),
    app                 = express(),
    User                = require("../models/user"),
    Review                = require("../models/reviews"),
    Announcement        = require("../models/announcement"),
    flash               = require("connect-flash"),
    Base64              = require("js-base64"),
    NodeGeocoder        = require("node-geocoder"),
    methodOverride      = require("method-override");
    multer 				= require("multer"),
    dotenv 				= require("dotenv");
    dotenv.config();

var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
// accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'syberiancats', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(flash());
app.use(methodOverride("_method"))

let options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
let geocoder = NodeGeocoder(options);


router.get("/", isAdminLoggedIn, (req, res) => {
    User.find({}, (err, users) => {
        if(err){
            console.log(err);
        } else {
            let header = "Wszyscy użytkownicy | 5zeta";
            res.render("./user/index", {
                header: header,
                currentUser: req.user,
                users:users
            });
        }
    })
   
})

router.get("/search", isAdminLoggedIn, (req, res) => {
    const regex = new RegExp(escapeRegex(req.query.username), 'gi');
   
    
        User
        .find({username: regex})
        .exec((err, users) => {
            if(err){
                console.log(err)
            } else {
                let header = `Wyszukiwanie użytkowników po parametrze ${req.query.username} | 5zeta`;
                res.render("./user/search", {
                    header: header,
                    users: users,
                    param: req.query.username,
                    currentUser: req.user
                })
            }
        })
    
})

router.get("/new", function (req, res) {
    let header = `Rejestracja | 5zeta`;
    res.render("./user/new", { header: header, user: req.body })
});

router.post("/new", function (req, res) {
    if (req.body.confirm === req.body.password) {
        
        geocoder.geocode(req.body.location, function (err, data) {
            if (err || !data.length) {
                req.flash('error', err.message);


                return res.redirect("back")
            }
            let verificationCode = '';
            for (let i = 0; i <= 5; i++) {
                let number = Math.floor(Math.random() * 10);
                let numberString = number.toString();
                verificationCode += numberString;
            }
            let street = `${data[0].streetName} ${data[0].streetNumber}`;
            let name = Base64.encode(req.body.name);
            let email = Base64.encode(req.body.email);
            let location = Base64.encode(data[0].formattedAddress);
            let newUser = new User({
                username: req.body.username,
                email: email,
                name: name,
                location: location,
                lat: data[0].latitude,
                lng: data[0].longitude,
                verificationCode: verificationCode,
                street: Base64.encode(street),
                city: Base64.encode(data[0].city),
                district: Base64.encode(data[0].administrativeLevels.level1short),
                role: Base64.encode(req.body.role)
            });
            User.register(newUser, req.body.password, function (err, user) {
                if (err) {
                    let header = `Rejestracja | 5zeta`;
                    return res.render("./user/new", { header: header, user: req.body });
                }
                passport.authenticate("local")(req, res, function () {
                    user.verificationExpires = Date.now() + 360000;
                    user.save()
                    async function sendVerificationEmail(user) {
                        const mailgun = require("mailgun-js");
                        const DOMAIN = '5zeta.pl';
                        const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN, host: "api.eu.mailgun.net" });
                        const data = {
                            from: `Weryfikacja konta 5zeta.pl <verification@5zeta.pl>`,
                            to: `${Base64.decode(user.email)}`,
                            subject: `Potwierdzenie emaila w 5zeta.pl`,
                            html: `<html>
                                    <head>
                                        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                                            integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                                        <link rel="stylesheet" type="text/css" href="./style.css">
                                    </head>
                                    <body>
                                        <p class="description">
                                            Witaj <em>${user.username}</em>,
                                            <br>
                                            Jesteś na ostatniej prostej do możliwości dodawania ogłoszeń w portalu
                                            5zeta.pl. Wystarczy, że potwierdzisz swój email poniższym 
                                            kodem weryfikacyjnym:
                                            <br>
                                            <br>
                                            <strong>${user.verificationCode}</strong>
                                            <br>
                                            <br>
                                            Pozdrawiamy,
                                            <br>
                                            Zespół 5zeta.pl
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
                    sendVerificationEmail(user)
                    res.redirect(`/user/${user._id}/verification`);
                });
            });
        });
       
    } else {
        req.flash("error", "Hasła nie są zgodne");
        let header = `Rejestracja | 5zeta`;
        res.render("./user/new", { header: header, user: req.body });
    }


});

router.post("/:user_id/resend/verification", (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
        if(err){
            console.log(err)
        } else {
            let verificationCode = '';
            for (let i = 0; i <= 5; i++) {
                let number = Math.floor(Math.random() * 10);
                let numberString = number.toString();
                verificationCode += numberString;
            }
            user.verificationCode = verificationCode;
            user.verificationExpires = Date.now() + 360000;
            user.save()
            async function sendVerificationEmail(user) {
                const mailgun = require("mailgun-js");
                const DOMAIN = '5zeta.pl';
                const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN, host: "api.eu.mailgun.net" });
                const data = {
                    from: `Weryfikacja konta 5zeta.pl <verification@5zeta.pl>`,
                    to: `${Base64.decode(user.email)}`,
                    subject: `Ponowne wysłanie kodu, by potwierdzić email`,
                    html: `<html>
                                    <head>
                                        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                                            integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                                        <link rel="stylesheet" type="text/css" href="./style.css">
                                    </head>
                                    <body>
                                        <p class="description">
                                            Witaj <em>${user.username}</em>,
                                            <br>
                                            Właśnie dostaliśmy prośbę o ponowne wysłanie kodu do
                                            weryfikacji emaila na portalu ogłoszeniowym 5zeta.
                                            Jeśli to nie byłeś/aś ty, zignoruj wiadomość. 
                                            <br>
                                            Kod potrzebny do weryfikacji to:
                                            <br>
                                            <br>
                                            <strong>${user.verificationCode}</strong>
                                            <br>
                                            <br>
                                            Pozdrawiamy,
                                            <br>
                                            Zespół 5zeta.pl
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
            sendVerificationEmail(user)
            res.redirect(`/user/${user._id}/verification`);
        }
    })
})

router.get("/:user_username/dashboard", isLoggedIn, (req, res) => {
    if(Base64.decode(req.user.role) === 'admin'){
        Announcement
            .find({})
            .populate(["category", "author"])
            .sort({added: -1})
            .exec((err, announcements) => {
            if(err){
                console.log(err)
            } else {
                let header = `${req.params.user_username} dashboard | 5zeta`;
                res.render("./user/dashboard", {
                    currentUser: req.user,
                    header: header,
                    announcements: announcements
                })
            }
        })
    } else {
        Announcement
            .find({author: req.user._id})
            .populate(["category", "author"])
            .sort({added: -1})
            .exec((err, announcements) => {
            if(err){
                console.log(err)
            } else {
                let header = `${req.params.user_username} dashboard | 5zeta`;
                res.render("./user/dashboard", {
                    currentUser: req.user,
                    header: header,
                    announcements: announcements
                })
            }
        })
    }
   
})

router.get('/:user_id/verification', (req, res) => {
    User.findOne({
        $and: [
            {_id: req.params.user_id},
            {verificationExpires: { $gt: Date.now()}}
        ]
    }, (err, user) => {
        if(err){
            console.log(err)
        } else {
            if(user){
                let header = "Weryfikacja konta | 5zeta.pl"
                res.render("./user/verification", {
                    header: header,
                    user: user
                })
            } else {
                req.flash("error", "Kod weryfikacyjny wygasł lub nie ma takiego konta. Kliknij przycisk Wyślij kod ponownie poniżej ")
                let header = "Weryfikacja konta | 5zeta.pl"
                res.render("./user/verification", {
                    header: header,
                    user_id: req.params.user_id
                })
            }
        }
    })
})

router.post("/:user_id/verification", (req, res) => {
    User.findOne({
        $and: [
            {_id: req.params.user_id},
            {verificationExpires: { $gt: Date.now()}}
        ]
    }, (err, user) => {
        if(err){
            console.log(err)
        } else {
            if(user){
                if(user.verificationCode === req.body.code){
                    user.verificated = true;
                    user.save();
                    req.flash("success", `Witaj ${user.username}. Bardzo nam miło, że do nas dołączyłeś`)
                    res.redirect("/login")
                } else {
                    req.flash("error", "Kod weryfikacyjny jest niepoprawny. Spróbuj ponownie")
                    let header = "Weryfikacja konta | 5zeta.pl"
                    res.render("./user/verification", {
                        header: header,
                        user: user
                    })
                }
            } else {
                req.flash("error", "Kod weryfikacyjny wygasł lub nie ma takiego konta. Kliknij przycisk Wyślij kod ponownie poniżej ")
                res.redirect("back")
            }
        }
    })
})

router.get("/:user_username/info", (req, res) => {
    User.findOne({username: req.params.user_username}, (err, user) => {
        if(err){
            console.log(err)
        } else {
            Review.find({user: user._id}, (err, reviews) => {
                let header = `Profil ${user.username} | 5zeta`;
                res.render("./user/show", {
                    header: header,
                    user: user,
                    logged: req.user,
                    reviews: reviews
                })
            })
            
        }
    })
})

router.post("/:user_id/contact", (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
        if(err){
            req.flash("error", err.message);
            return res.redirect("back")
        }
        const mailgun = require("mailgun-js");
        const DOMAIN = '5zeta.pl';
        const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN, host:"api.eu.mailgun.net"});
        const data = {
            from: `${req.body.name} <${req.body.email}>`,
            to: `${Base64.decode(user.email)}`,
            subject: `${req.body.topic}`,
            text: `${req.body.text}`
        };
        mg.messages().send(data, function (error, body) {
            if(error){
                req.flash("error", error.message);
                return res.redirect("back")
            } else {
                req.flash("success", `Pomyślnie wysłano emaila do ${user.username}. Dalsza konwersacja będzie prowadzona tylko przez maila`);
                return res.redirect("back")
            }
        });
    })
})

router.get("/:user_id/edit", isLoggedIn, (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
        if(err){
            console.log(err)
        } else {
            let header = `Edytuj profil ${user.username} | 5zeta`;
            res.render("./user/edit", {
                header: header,
                user: user
            })
        }
    })
})

router.put("/:user_id", isLoggedIn, (req, res) => {
    User.findById(req.params.user_id, (err, updatedUser) => {
         
        geocoder.geocode(req.body.user.location, function (err, data) {
            if (err || !data.length) {
                req.flash('error', err.message);


                return res.redirect("back")
            }
            
            let street = `${data[0].streetName} ${data[0].streetNumber}`;
            
               
            updatedUser.location = Base64.encode(data[0].formattedAddress);
            updatedUser.lat = data[0].latitude;
            updatedUser.lng = data[0].longitude;
            updatedUser.city = Base64.encode(data[0].city);
            updatedUser.name = Base64.encode(req.body.user.name);
            updatedUser.email = Base64.encode(req.body.user.email);
            updatedUser.district = Base64.encode(data[0].administrativeLevels.level1short);
            updatedUser.street = Base64.encode(street);
            if(req.body.user.description){
                updatedUser.description = Base64.encode(req.body.user.description);

            }
            
            updatedUser.save();
            req.flash("success", "Pomyślnie zaktualizowano twoje informacje profilowe");
            res.redirect(`/user/${updatedUser.username}/dashboard`)  
           
        });
    })
})

router.get("/:user_id/edit/picture", isLoggedIn, (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
        if(err){
            console.log(err)
        } else {
            let header = `Edytuj zdjęcie profilowe ${user.username} | 5zeta`;
            res.render("./user/editP", {
                header: header,
                user: user
            })
        }
    })
})

router.post("/:user_id/edit/picture", isLoggedIn, upload.single("profile"), (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
        if(err){
            console.log(err)
        } else {
            cloudinary.uploader.upload(req.file.path, function(result) {
                user.profile = result.secure_url;
                user.save();
                req.flash("success", "Pomyślnie zaktualizowano twoje zdjęcie profilowe")
                res.redirect(`/user/${user.username}/dashboard`)
            });
        }
    })
})

router.get("/:user_id/delete/confirm", isLoggedIn, (req, res) => {
    User.findById(req.params.user_id, (err, user) => {
        if(err){
            console.log(err)
        } else {
           let header = `Potwierdzenie usunięcia konta | 5zeta`;
           res.render("./user/deleteConfirm", {
               currentUser: req.user,
               header: header,
               user: user
           })
        }
    })
})

router.delete("/:user_id", isLoggedIn, (req, res)=> {
    
    if(req.body.reason){
        User.findById(req.params.user_id, (err, user) => {
            if(err){
                console.log(err)
            } else {
               
                const mailgun = require("mailgun-js");
                const DOMAIN = '5zeta.pl';
                const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN, host: "api.eu.mailgun.net" });
                const data = {
                    from: `Administrator 5zeta.pl <admin@5zeta.pl>`,
                    to: `${Base64.decode(user.email)}`,
                    subject: `Twoje konto zostało usunięte`,
                    html: `<html>
                                        <head>
                                            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                                                integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                                            <link rel="stylesheet" type="text/css" href="./style.css">
                                        </head>
                                        <body>
                                            <p class="description">
                                                Witaj <em>${user.username}</em>,
                                                <br>
                                                Właśnie usunąłem twoje konto z powodu "${req.body.reason}".
                                                Przypominam, że to działanie jest zgodne z postanowieniami ogólnymi w naszym regulaminie.

                                                <br>
                                                
                                                <br>
                                                <em>Nie odpowiadaj na tego maila, wiadomość wysłana automatycznie</em>
                                                <br>
                                                <br>
                                                Pozdrawiamy,
                                                <br>
                                                Zespół 5zeta.pl
                                            </p>
                                        </body>
                                    </html>`
                };
                mg.messages().send(data, function (error, body) {
                    if (error) {
                        console.log(error)
                    }
                });
                user.delete();
                req.flash("success", "Pomyślnie usunięto konto z bazy danych")
                res.redirect(`/user`);
            }
        })
    } else {
        User.findByIdAndDelete(req.params.user_id, (err, deletedUser) => {
            if(err){
                console.log(err)
            } else {
                req.flash("success", "Pomyślnie usunięto twoje konto z bazy danych")
                res.redirect(`/login`)
            }
        })
    }
    
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Zaloguj się lub zarejestruj, by móc wykonać tę czynność");
    res.redirect(`/login`);
}

function isAdminLoggedIn (req, res, next) {
    if(req.isAuthenticated()) {
        if(Base64.decode(req.user.role) === 'admin'){
            return next();
        }
        req.flash("error", "Ta strona jest tylko dostępna dla administratorów");
        res.redirect(`/login`);
    } else {
        req.flash("error", "Zaloguj się lub zarejestruj, by móc wykonać tę czynność");
        res.redirect(`/login`);
    }
    
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;