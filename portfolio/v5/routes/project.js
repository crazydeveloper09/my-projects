const express = require("express"),
    Project = require("../models/project"),
    Comment = require("../models/comment"),
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



router.get("/new", isLoggedIn, function(req, res){
    Project.find({}, function(err, projects){
        if(err) {
            console.log(err);
        } else {
            let header = "Dodaj projekt | Projekty | Portfolio | Maciej Kuta";
            res.render("./projects/new", {projects: projects, header: header});
        }
    });
});





router.get("/:link", function(req, res){
    Project.findOne({subpageLink: req.params.link}, function(err, project){
        if(err) {
            console.log(err);
        } else {
            i18n.setLocale(req.language);
            Comment.find({project: project._id}, function(err, reviews){
                if(err){
                    console.log(err);
                } else {
                    console.log(reviews);
                    let header = `${project.title} | Projekty | Portfolio | Maciej Kuta`;
                    res.render("./projects/show", {project: project, currentUser: req.user, header: header, reviews: reviews, lang: req.language});
                }
            });
           
        }
    });
});

router.get("/type/:type", function(req, res){
    Project.find({type: req.params.type}, function(err, projects){
        if(err) {
            console.log(err);
        } else {
            i18n.setLocale(req.language)
            let header = `${req.params.type} | Projekty | Portfolio | Maciej Kuta`;
            res.render("./projects/type", {projects: projects, currentUser: req.user, lang:req.language, header: header, my:""});
        }
    });
});

router.get("/", function(req, res){
    Project.find({}, function(err, projects){
        if(err) {
            console.log(err);
        } else {
            i18n.setLocale(req.language)
            let header = `Wszystkie projekty | Projekty | Portfolio | Maciej Kuta`;
            res.render("./projects/index", {projects: projects, currentUser: req.user, lang:req.language, header: header, my:""});
        }
    });
});

router.post("/",upload.single("profile"),function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        let newProject = new Project({
            title: req.body.title,
            description: req.body.description,
            profile: result.secure_url,
            status: req.body.status,
            link: req.body.link,
            subpageLink: req.body.title.toLowerCase().split(' ').join('-'),
            pictures: [],
            added: Date.now(),
			en: req.body.english,
			statusEn: req.body.statusEn
        });
        Project.create(newProject, function(err, project){
            if(err) {
                console.log(err)
            } else {
                console.log(req.body);
                project.type= req.body.type;
                project.save();
                res.redirect("/projects/" + project.subpageLink);
            }
        });
    });
    
});


router.get("/:id/new/picture", isLoggedIn, function(req, res){
    Project.findById(req.params.id, function(err, project){
        if(err){
            console.log(err)
        } else {
            let header = `Dodaj zdjęcie | ${project.title} | Projekty | Portfolio | Maciej Kuta`;
            res.render("./projects/addP", {header: header, project:project})
        }
    })
})

router.post("/:id/new/picture",upload.single("picture"), function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        Project.findById(req.params.id, function(err, project){
            if(err) {
                console.log(err)
            } else {
                project.pictures.push(result.secure_url);
                project.added = Date.now();
                project.save();
                res.redirect("/projects/" + project.subpageLink);
            }
        });
    });
    
});

router.get("/:id/edit", isLoggedIn, function(req, res){
    Project.findById(req.params.id, function(err, project){
        if(err) {
            console.log(err);
        } else {
            let header = `Edytuj | ${project.title} | Projekty | Portfolio | Maciej Kuta`;
            res.render("./projects/edit", {project: project, header:header});
        }
    });
});


router.get("/:id/edit/picture", isLoggedIn, function(req, res){
    Project.findById(req.params.id, function(err, project){
        if(err){
            console.log(err)
        } else {
            let header = `Edytuj zdjęcie główne | ${project.title} | Projekty | Portfolio | Maciej Kuta`;
            res.render("./projects/editP", {header: header, project:project})
        }
    })
})



router.post("/:id/edit/picture", upload.single("picture"), function(req, res){
   
    cloudinary.uploader.upload(req.file.path, function(result) {
      
        Project.findById(req.params.id, function(err, project){
            if(err) {
                console.log(err);
            } else {
                project.profile = result.secure_url;
                project.added = Date.now();
                project.save();
                res.redirect("/projects/" + project.subpageLink);
            }
        });
    });
    
});

router.put("/:id", isLoggedIn, function(req, res){
    Project.findByIdAndUpdate(req.params.id, req.body.project, function(err, updatedProject){
        if(err) {
            console.log(err);
        } else {
            console.log(req.body.project.type);
            updatedProject.added = Date.now();
            updatedProject.subpageLink = updatedProject.title.toLowerCase().split(' ').join('-');
            updatedProject.type = req.body.project.type;
            updatedProject.save();
            res.redirect("/projects/" + updatedProject.subpageLink);
        }
    });
});

router.get("/:id/delete", isLoggedIn, function(req, res){
    Project.findByIdAndDelete(req.params.id, function(err, deletedProject){
        if(err) {
            console.log(err);
        } else {
            res.redirect("/");
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


module.exports = router
