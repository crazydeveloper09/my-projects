const express = require("express"),
    User = require("../models/user"),
    app = express(),
    methodOverride = require("method-override"),
    NodeGeocoder    = require("node-geocoder"),
    multer                = require("multer"),
	
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

let admin_username = "Paweł";

let options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
  };
let geocoder = NodeGeocoder(options);

router.get("/:id/edit/picture", isLoggedIn, function(req, res){
    User.findById(req.params.id, function(err, user){
        if(err){
            console.log(err)
        } else {
            let header = `Edytuj zdjęcie profilowe ${user.username} | Noir Architekci`;
            res.render("./user/editP", {header: header, user:user})
        }
    })
})



router.post("/:id/edit/picture", upload.single("picture"), function(req, res){
   
    cloudinary.uploader.upload(req.file.path, function(result) {
      
        User.findById(req.params.id, function(err, users){
            if(err) {
                console.log(err);
            } else {
                users.photo = result.secure_url;
                users.save();
                res.redirect("/#about");
            }
        });
    });
    
});

router.get("/:id/edit", isLoggedIn, (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if(err){
            console.log(err);
        } else {
            let header = `Edytuj użytkownika ${user.username} | Noir Architekci`;
            res.render("./user/edit", {user:user, header: header, currentUser: req.user});
            
            
        }
    })
});

router.put("/:id", isLoggedIn, (req, res) => {
    geocoder.geocode(req.body.user.location, function (err, data) {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        User.findByIdAndUpdate(req.params.id, req.body.user, (err, updatedUser) => {
            if(err){
                console.log(err)
            } else {
                let street = data[0].streetName + " " + data[0].streetNumber;
                console.log(street)
                updatedUser.location = data[0].formattedAddress;
                updatedUser.lat = data[0].latitude;
                updatedUser.lng = data[0].longitude;
                updatedUser.postCode = data[0].zipcode;
                updatedUser.city =  data[0].city;
                updatedUser.street = street;
                updatedUser.save();
                res.redirect("/#about")
            }
        })
    });
    
})

function isLoggedIn (req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Nie masz dostępu do tej strony");
    res.redirect(`/?return_route=${req._parsedOriginalUrl.path}`);
}

module.exports = router;