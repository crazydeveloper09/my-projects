const express      = require("express"),
    Achievement          = require("../models/achievement"),
	  User         = require("../models/user"),
    app            = express(),
    methodOverride = require("method-override"),
    multer         = require("multer"),
    i18n 		   = require("i18n"),
    router         = express.Router({mergeParams: true}),
    dotenv         = require("dotenv"),
    flash = require("connect-flash");
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

router.get("/add", isLoggedIn, (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err){
            console.log(err);
        } else {
            let header = `Dodaj osiągnięcie | ${user.username} | Portfolio | Maciej Kuta`
            res.render("./achievements/new", {header: header, user:user})
        }
    })
})


router.post("/",upload.single("picture"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
		 User.findById(req.params.id, function(err, user){
                    if(err) {
                        console.log(err)
                    } else {
						 let newAchievement = new Achievement({
                            title: req.body.title,
                            titleEn: req.body.titleEn,
							picture: result.secure_url
						});
						Achievement.create(newAchievement, function(err, achievement){
							if(err){
								console.log(err);
							} else {
								user.achievements.push(achievement._id);
								user.save();
								res.redirect("/about");
							}
						});
                        
                    }
                });
       
    });
    
   
});

router.get("/:id/edit", isLoggedIn, function(req, res){
    Achievement.findById(req.params.id, function(err, achievement){
        if(err) {
            console.log(err);
        } else {
            let header = `Edytuj ${achievement.title} | Portfolio | Maciej Kuta`
            res.render("./achievements/edit", {achievement: achievement, header: header, currentUser: req.user});
        }
    });
});


router.get("/:id/edit/picture", isLoggedIn, function(req, res){
    Achievement.findById(req.params.id, function(err, achievement){
        if(err){
            console.log(err)
        } else {
            let header = `Edytuj zdjęcie główne | ${achievement.title} | Portfolio | Maciej Kuta `
            res.render("./achievements/editP", {header: header, achievement:achievement, currentUser: req.user})
        }
    })
})



router.post("/:id/edit/picture", upload.single("picture"), function(req, res){
   
    cloudinary.uploader.upload(req.file.path, function(result) {
      
        Achievement.findById(req.params.id, function(err, achievement){
            if(err) {
                console.log(err);
            } else {
                achievement.picture = result.secure_url;
                
                achievement.save();
                res.redirect("/about");
            }
        });
    });
    
});

router.put("/:id", isLoggedIn, function(req, res){
    Achievement.findByIdAndUpdate(req.params.id, req.body.achievement, function(err, updatedachievement){
        if(err) {
            console.log(err);
        } else {
            
            res.redirect("/about");
        }
    });
});

router.get("/:id/delete", isLoggedIn, function(req, res){
    Achievement.findByIdAndDelete(req.params.id, function(err, deletedachievement){
        if(err) {
            console.log(err);
        } else {
            res.redirect("/about");
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
