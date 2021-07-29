const express = require("express"),
    Bootcamp = require("../models/bootcamp"),
    app = express(),
    methodOverride = require("method-override"),
    multer                = require("multer"),
	i18n 				  = require("i18n"),
    dotenv                = require("dotenv"),
    flash = require("connect-flash"),
    router = express.Router({mergeParams: true});
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


router.get("/new", isLoggedIn, function(req, res){
    Bootcamp.findById(req.params.bootcamp_id, function(err, bootcamp){
        if(err){
            console.log(err);
        } else {
            let header = `Dodaj ćwiczenie | ${bootcamp.title} | Bootcamp | Portfolio | Maciej Kuta`;
            res.render("./bootcamp/newexerc", {header:header, bootcamp: bootcamp});
        }
    });
    
});

router.post("/", upload.single("profile"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        Bootcamp.findById(req.params.bootcamp_id, function(err, bootcamp){
            if(err){
                console.log(err)
            } else {
                let link = "/bootcamps/" + bootcamp.subpageLink + "/exercises/" + req.body.link;
                Exercise.create({title: req.body.title, profile: result.secure_url, link: link }, function(err, createdExercise){
                    if(err){
                        console.log(err);
                    } else {
                        bootcamp.exercises.push(createdExercise);
                        bootcamp.save();
                        res.redirect("/bootcamps/" + bootcamp.subpageLink);
                    }
                });
            }
        });
    });
   
});

router.get("/:exercise_id/delete", isLoggedIn, function(req, res){
    Exercise.findByIdAndRemove(req.params.exercise_id, function(err, deletedBootcamp){
        if(err){
            console.log(err);
        } else {
            res.redirect("/bootcamps/" + req.params.bootcamp_id);
        }
    });
});

router.get("/colorgame", function(req, res){
    let header = `Zgadywanie kolorów | Bootcamp | Portfolio | Maciej Kuta`;
	res.render("color", { header: header  });
});

router.get("/score-keeper", function(req, res){
    let header = `Score keeper | Bootcamp | Portfolio | Maciej Kuta`;
	res.render("score", { header: header });
})


function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", i18n.__("Nie masz dostępu do tej strony"));
    res.redirect("/");
}

module.exports = router;