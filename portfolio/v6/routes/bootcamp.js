const express = require("express"),
	  Exercise = require("../models/exercise"),
    Bootcamp = require("../models/bootcamp"),
    app = express(),
    methodOverride = require("method-override"),
    multer                = require("multer"),
	i18n 				  = require("i18n"),
    dotenv                = require("dotenv"),
    flash = require("connect-flash"),
    router = express.Router();
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
app.use(methodOverride("_method"));


router.get("/", function(req, res){
    Bootcamp.find({}, function(err, bootcamps){
        if(err){
            console.log(err);
        } else {
            let header = "Bootcamp | Portfolio | Bootcamp";
            res.render("./bootcamp/index", {header:header, bootcamps: bootcamps, currentUser: req.user})
        }
    });
});
router.get("/new", isLoggedIn, function(req, res){
    let header = "Nowy bootcamp | Portfolio | Maciej Kuta"
    res.render("./bootcamp/new", {header: header})
});

router.get("/:id", function(req, res){
    Bootcamp.findOne({subpageLink: req.params.id}).populate("exercises").exec(function(err, bootcamp){
        if(err){
            console.log(err);
        } else {
            let header = `${bootcamp.title} | Bootcamp | Portfolio | Maciej Kuta`;
            res.render("./bootcamp/show", {header: header, bootcamps: bootcamp, currentUser: req.user})
        }
    });
});



router.post("/", upload.single("profile"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        let newBootcamp = new Bootcamp({
            title: req.body.title,
            profile: result.secure_url,
            instructor: req.body.instructor,
            progress: req.body.progress,
            link: req.body.link,
            subpageLink: req.body.title.toLowerCase().split(' ').join('-')
        });
        Bootcamp.create(newBootcamp, function(err, createdBootcamp){
            if(err){
                console.log(err);
            } else {
                res.redirect("/" + createdBootcamp.subpageLink);
            }
        });
    });  
})

router.get("/:id/edit", isLoggedIn, function(req, res){
    Bootcamp.findById(req.params.id, function(err, bootcamp){
        if(err){
            console.log(err);
        } else {
            let header = `Edytuj ${bootcamp.title} | Bootcamp | Portfolio | Maciej Kuta`;
            res.render("./bootcamp/edit", {header:header, bootcamp: bootcamp})
        }
    });
});

router.put("/:id", isLoggedIn, function(req, res){
    Bootcamp.findByIdAndUpdate(req.params.id, req.body.bootcamp, function(err, updatedBootcamp){
        if(err){
            console.log(err);
        } else {
            updatedBootcamp.subpageLink = updatedBootcamp.title.toLowerCase().split(' ').join('-');
            updatedBootcamp.save();
            res.redirect("/" + updatedBootcamp.subpageLink);
        }
    })
});

router.get("/:id/delete", isLoggedIn, function(req, res){
    Bootcamp.findByIdAndRemove(req.params.id, function(err, updatedBootcamp){
        if(err){
            console.log(err);
        } else {
            res.redirect("");
        }
    })
});

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", i18n.__("Nie masz dostępu do tej strony"));
    res.redirect("/");
}

module.exports = router;
