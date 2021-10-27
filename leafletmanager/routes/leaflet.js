const express           = require("express"),
    router              = express.Router({mergeParams: true}),
    app                 = express(),
    Leaflet             = require("../models/leaflet"),
    Territory           = require("../models/territory"),
    multer              = require("multer"),
    sanitizeHTML        = require("sanitize-html"),
    flash               = require("connect-flash"),
    methodOverride      = require("method-override"),
    storage             = multer.diskStorage({
                            filename: function(req, file, callback) {
                            callback(null, Date.now() + file.originalname);
                            }
                        }),
    imageFilter         = function (req, file, cb) {
                            // accept image files only
                            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf)$/i)) {
                                return cb(new Error('Tylko zdjęcia, plik pdf są dozwolone'), false);
                            }
                            cb(null, true);
                        },
    upload              = multer({ storage: storage, fileFilter: imageFilter}),
    cloudinary          = require('cloudinary');



    require("dotenv").config()
    cloudinary.config({ 
        cloud_name: 'syberiancats', 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    }); 
   

app.use(flash());
app.use(methodOverride("_method"))

router.get("/", isCompanyLoggedIn, function(req, res){
    Leaflet.find({company: req.user._id}, function(err, leaflets){
        if(err){
            console.log(err);
        } else {
            res.render("./leaflets/index", { 
                currentUser: req.user, 
                leaflets: leaflets, 
                header: `Ulotki firmy ${req.user.username} | Leaflet Manager`, 
                leaflet: ""  
            });
        }
    });
	
});




router.get("/new", isCompanyLoggedIn, function(req, res){
	res.render("./leaflets/new", { 
        currentUser: req.user, 
        header: "Dodaj ulotkę | Leaflet Manager", 
    });
});

router.post("/", upload.single("file"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
      
        let newLeaflet = new Leaflet({
            title: sanitizeHTML(req.body.title),
            description: sanitizeHTML(req.body.description),
            type: req.body.type,
            file: result.secure_url,
            format: result.format,
            company: req.user._id
        });
        Leaflet.create(newLeaflet, function(err, user) {
            if(err) {
                
                return res.render("./leaflets/new", { header:"Dodaj ulotkę | Leaflet Manager", error: err.message, currentUser: req.user});
            } 

            req.flash("success", "Pomyślnie dodano ulotkę")
            res.redirect("/leaflets");
           
        });
    });
   
});


router.get("/:leaflet_id/edit/file", isCompanyLoggedIn, function(req, res){
    Leaflet.findById(req.params.leaflet_id, function(err, leaflet){
        if(err){
            console.log(err)
        } else {
            let header = `Edytuj plik | ${leaflet.title} | Leaflet Manager`;
            res.render("./leaflets/editF", {header: header, leaflet:leaflet})
        }
    })
})



router.post("/:leaflet_id/edit/file", upload.single("file"), function(req, res){
   
    cloudinary.uploader.upload(req.file.path, function(result) {
      
        Leaflet.findById(req.params.leaflet_id, function(err, leaflet){
            if(err) {
                console.log(err);
            } else {
                leaflet.file = result.secure_url;
                leaflet.format = result.format;
                leaflet.save();
                res.redirect("/leaflets");
            }
        });
    });
    
});

router.get("/:leaflet_id/edit", isCompanyLoggedIn, function(req, res){
    Leaflet.findById(req.params.leaflet_id, function(err, leaflet){
        if(err){
            console.log(err);
        } else {
            res.render("./leaflets/edit", { 
                currentUser: req.user, 
                leaflet: leaflet, 
                header: `Edytuj ulotkę ${leaflet.title} | Leaflet Manager`
            });
        }
    });
});

router.put("/:leaflet_id", isCompanyLoggedIn, function(req, res){
    Leaflet.findByIdAndUpdate(req.params.leaflet_id, req.body.leaflet, function(err, leaflet){
        if(err){
            console.log(err);
        } else {
            leaflet.name = sanitizeHTML(req.body.leaflet.name);
            leaflet.description = sanitizeHTML(req.body.leaflet.description)
            leaflet.save();
            res.redirect("/leaflets");
        }
    });
});
router.get("/:leaflet_id/delete/confirm", isCompanyLoggedIn, function(req, res){
    Leaflet.findById(req.params.leaflet_id, function(err, leaflet){
        if(err){
            console.log(err);
        } else {
            res.render("./leaflets/confirm", {
                leaflet: leaflet,
                currentUser: req.user,
                header: `Potwierdzenie usunięcia ulotki | Leaflet Manager`
            });
        }
    });
});
router.delete("/:leaflet_id", isCompanyLoggedIn, function(req, res){
    Leaflet.findByIdAndDelete(req.params.leaflet_id, function(err, leaflet){
        if(err){
            console.log(err);
        } else {
            Territory.find({leaflet: leaflet._id}, (err, territories) => {
                territories.forEach((territory) => {
                
                    territory.leaflet = undefined;
                    territory.save();
                })
                res.redirect("/leaflets");
            })
        }
    });
});

router.get("/search", isCompanyLoggedIn, function(req, res){
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Leaflet.find({$and: [{title: regex}, {company: req.user._id}]}, function(err, leaflets){
        if(err){
            console.log(err);
        } else {
            console.log(regex)
            res.render("./leaflets/search", {
                param: req.query.search, 
                leaflets: leaflets, 
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
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;