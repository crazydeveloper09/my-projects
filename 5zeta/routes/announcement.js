const express = require("express"),
    router = express.Router(),
    app = express(),
    Category = require("../models/category"),
    Type = require("../models/type"),
    Announcement = require("../models/announcement"),
    Picture = require("../models/picture"),
    flash = require("connect-flash"),
    atob                = require("atob"),
    btoa                = require("btoa"),
    methodOverride = require("method-override");
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
const announcement = require("../models/announcement");
cloudinary.config({ 
  cloud_name: 'syberiancats', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(flash());
app.use(methodOverride("_method"));

router.get("/", (req, res) => {
    Announcement
        .find({})
        .populate(["category", "author"])
        .sort({added: -1})
        .exec((err, announcements) => {
            if(err){
               req.flash("error", err.message);
               res.redirect("/");
            } else {
                let header = "Wszystkie ogłoszenia | 5zeta";
                res.render("./announcements/index", {
                    header: header,
                    announcements: announcements,
                    logged: req.user
                })
            }
        })
})


router.get("/search/advanced", (req, res) => {
    
    let params = {
        title: req.query.title,
        price: req.query.price,
        keyword: req.query.keyword,
        howToSearchPrice: req.query.howToSearchPrice
    }
    if(req.query.howToSearchPrice === "greater"){
        const title = new RegExp(escapeRegex(req.query.title), 'gi');
        const keyword = new RegExp(escapeRegex(req.query.keyword), 'gi');
        Announcement
            .find({
                $and:[
                    {title: title},
                    {keywords: keyword},
                    {price: {$gte: req.query.price}}
                ]
            })
            .populate(["category", "author"])
            .sort({added: -1})
            .exec((err, announcements) => {
                if(err){
                    console.log(err);
                } else {
                    let header = "Zaawansowane wyszukiwanie ogłoszeń | 5zeta";
                    res.render("./announcements/advanced", {
                        header: header,
                        announcements: announcements,
                        params: params,
                        logged: req.user
                    })
                }
            })
    } else {
        const title = new RegExp(escapeRegex(req.query.title), 'gi');
        const keyword = new RegExp(escapeRegex(req.query.keyword), 'gi');
        Announcement
            .find({
                $and:[
                    {title: title},
                    {keywords: keyword},
                    {price: {$lte: req.query.price}}
                ]
            })
            .populate(["category", "author"])
            .sort({added: -1})
            .exec((err, announcements) => {
                if(err){
                    console.log(err);
                } else {
                    let header = "Zaawansowane wyszukiwanie ogłoszeń | 5zeta";
                    res.render("./announcements/advanced", {
                        header: header,
                        announcements: announcements,
                        params: params,
                        logged: req.user
                    })
                }
            })
    }
})


router.get("/search", (req, res) => {
    const regex = new RegExp(escapeRegex(req.query.title), 'gi');
   
    if(req.query.author_id){
        Announcement
        .find({$and: [{title: regex}, {author: req.query.author_id}]})
        .populate(["category", "author"])
        .sort({added: -1})
        .exec((err, announcements) => {
            if(err){
                console.log(err)
            } else {
                let header = `Wyszukiwanie ogłoszeń po parametrze ${req.query.title} | 5zeta`;
                res.render("./announcements/search", {
                    header: header,
                    announcements: announcements,
                    param: req.query.title,
                    logged: req.user
                })
            }
        })
    } else {
        Announcement
        .find({title: regex})
        .populate(["category", "author"])
        .sort({added: -1})
        .exec((err, announcements) => {
            if(err){
                console.log(err)
            } else {
                let header = `Wyszukiwanie ogłoszeń po parametrze ${req.query.title} | 5zeta`;
                res.render("./announcements/search", {
                    header: header,
                    announcements: announcements,
                    param: req.query.title,
                    logged: req.user
                })
            }
        })
    }
  

})

router.get("/new", isLoggedIn, (req, res) => {
    Category.find({}, (err, categories) => {
        if(err){
            console.log(err)
        } else {
            Type.find({}, (err, types) => {
                if(err){
                    console.log(err)
                } else {
                    let header = "Dodaj ogłoszenie | 5zeta";
                    res.render("./announcements/new", {
                        header: header, 
                        currentUser: req.user,
                        categories: categories,
                        types: types
                    });
                }
            })
           
        }
    })
   
})

router.post("/", upload.single("profile"), isLoggedIn, (req, res) => {
    cloudinary.uploader.upload(req.file.path, function(result) {
        let newAnnouncement = new Announcement({
            title: req.body.title,
            description: req.body.description,
            type: req.body.type,
            author: req.user._id,
            category: req.body.category,
            profile: result.secure_url,
            price: req.body.price,
            link: req.body.title.toLowerCase().split(' ').join('-'),
            keywords: req.body.keywords
        })
        Announcement.create(newAnnouncement, (err, createdAnnouncement) => {
            if(err){
                console.log(err)
            } else {
                Category.findById(req.body.category, (err, category) => {
                    if(err) {
                        console.log(err)
                    } else {
                        category.announcements.push(createdAnnouncement);
                        category.save()
                        Type.findById(req.body.type, (err, type) => {
                            if(err) {
                                console.log(err)
                            } else {
                                type.announcements.push(createdAnnouncement);
                                type.save()
                                res.redirect(`/user/${req.user.username}/dashboard`)
                            }
                        })
                       
                    }
                })
               
            }
        })
    });
    
})
router.get("/:announcement_link", (req, res) => {
    Announcement
    .findById(req.query.announcement_id)
    .populate(["category", "author", "pictures", "type"])
    .exec((err, announcement) => {
        if(err){
           req.flash("error", err.message);
           res.redirect("/");
        } else if(!announcement) {
            req.flash("error", "Nie znaleziono takiego ogłoszenia");
               res.redirect("/");
        } else {
            let header = `${announcement.title} | Ogłoszenia | 5zeta`;
            let keywords = `5zeta, 5zeta głogów, 5zeta nowa sól, portal ogłoszeniowy głógów, portal ogłoszeniowy nowa sól, portal ogłoszeniowy bytom odrzański, ${announcement.keywords}`;
            res.render("./announcements/show", {
                header: header,
                announcement: announcement,
                keywords: keywords,
                logged: req.user
            })
        }
    })
})
router.get("/:announcement_id/add/picture", isLoggedIn, function(req, res){
    Announcement.findById(req.params.announcement_id, function(err, announcement){
        if(err){
            console.log(err)
        } else {
            let header = `Dodaj zdjęcie do galerii ${announcement.title} | 5zeta`;
            res.render("./announcements/addP", {
                header: header,
                announcement: announcement,
                currentUser: req.user
            });
        }
    });
})

router.post("/:announcement_id/add/picture", upload.single("picture"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        Announcement.findById(req.params.announcement_id, function(err, announcement){
            if(err){
                console.log(err)
            } else {
                Picture.create({source: result.secure_url}, (err, createdPicture) => {

                    announcement.pictures.push(createdPicture);
                    announcement.save();
                    req.flash("success", "Poprawnie dodano zdjęcie do galerii. Kliknij w Modyfikacja --> Zobacz podgląd, by zobaczyć zmiany")
                    res.redirect(`/user/${req.user.username}/dashboard`)
                })
                
            }
        });
    });
   
})
router.get("/:announcement_id/edit/picture", isLoggedIn, function(req, res){
   
    Announcement.findById(req.params.announcement_id, function(err, announcement){
		if(err) {
			console.log(err);
		} else {
			let header = `Edytuj zdjęcie główne ${announcement.title} | 5zeta`;
			res.render("./announcements/editP", {
                announcement: announcement, 
                header: header,
                currentUser: req.user
            });
            
			
		}
	});
});

router.post("/:announcement_id/edit/picture", upload.single("picture"), function(req, res){
   
    cloudinary.uploader.upload(req.file.path, function(result) {
      
        Announcement.findById(req.params.announcement_id, function(err, announcement){
            if(err) {
                console.log(err);
            } else {
                announcement.profile = result.secure_url;
                announcement.save();
                res.redirect(`/user/${req.user.username}/dashboard`);
            }
        });
    });
    
});


router.get("/:announcement_id/edit", isLoggedIn, (req, res) => {
    Announcement.findById(req.params.announcement_id, (err, announcement) => {
        if(err){
            console.log(err)
        } else {
            let header = `Edytuj ogłoszenie ${announcement.title} | 5zeta`;
            res.render("./announcements/edit", {
                header: header,
                currentUser: req.user,
                announcement: announcement
            });
        }
    })
})

router.put("/:announcement_id", isLoggedIn, (req, res) => {
    Announcement.findByIdAndUpdate(req.params.announcement_id, req.body.announcement, (err, updatedAnnouncement) => {
        if(err){
            console.log(err)
        } else {
            updatedAnnouncement.link = req.body.announcement.title.toLowerCase().split(' ').join('-');
            updatedAnnouncement.save();
            res.redirect(`/user/${req.user.username}/dashboard`)
        }
    })
})

router.get("/:announcement_id/delete/confirm", isLoggedIn, (req, res) => {
    Announcement.findById(req.params.announcement_id, (err, announcement) => {
        if(err){
            console.log(err)
        } else {
           let header = `Potwierdzenie usunięcia ogłoszenia ${announcement.title} | 5zeta`;
           res.render("./announcements/deleteConfirm", {
               currentUser: req.user,
               header: header,
               announcement: announcement
           })
        }
    })
})

router.delete("/:announcement_id", isLoggedIn, (req, res)=> {
    if(req.body.reason){
        Announcement.findById(req.params.announcement_id).populate("author").exec((err, announcement) => {
            if(err){
                console.log(err)
            } else {
               
                const mailgun = require("mailgun-js");
                const DOMAIN = '5zeta.pl';
                const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN, host: "api.eu.mailgun.net" });
                const data = {
                    from: `Administrator 5zeta.pl <admin@5zeta.pl>`,
                    to: `${atob(announcement.author.email)}`,
                    subject: `Twoje ogłoszenie zostało usunięte`,
                    html: `<html>
                                        <head>
                                            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
                                                integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
                                            <link rel="stylesheet" type="text/css" href="./style.css">
                                        </head>
                                        <body>
                                            <p class="description">
                                                Witaj <em>${announcement.author.username}</em>,
                                                <br>
                                                Właśnie usunąłem twoje ogłoszenie pod tytułem: 
                                                "${announcement.title}" z powodu "${req.body.reason}".
                                                Przypominam, że to działanie jest zgodne z warunkami
                                                dodawania ogłoszeń wyszczególnionymi w naszym regulaminie.

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
                announcement.delete();
                req.flash("success", "Pomyślnie usunięto ogłoszenie z bazy danych")
                res.redirect(`/user/${req.user.username}/dashboard`);
            }
        })
    } else {
        Announcement.findByIdAndDelete(req.params.announcement_id, (err, deletedAnnouncement) => {
            if(err){
                console.log(err)
            } else {
                req.flash("success", "Pomyślnie usunięto twoje ogłoszenie z bazy danych")
                res.redirect(`/user/${req.user.username}/dashboard`)
            }
        })
    }
})

function isLoggedIn (req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Zaloguj się lub zarejestruj, by móc wykonać tę czynność");
    res.redirect(`/login`);
}

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;