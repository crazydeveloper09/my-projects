const express = require("express"),
    Project = require("../models/project"),
    Category = require("../models/category"),
    Picture = require("../models/picture"),
    app = express(),
    methodOverride = require("method-override"),
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



router.get("/new", isLoggedIn, function(req, res){
    Category.find({}, function(err, categories){
        if(err) {
            console.log(err);
        } else {
            let header = "Dodaj projekt | Projekty | Noir Architekci";
            res.render("./projects/new", {categories: categories, header: header});
        }
    });
});





router.get("/:link", function(req, res){
    Project.findOne({subpageLink: req.params.link}).populate("gallery").exec(function(err, project){
        if(err) {
            console.log(err);
        } else {
           
                    let header = `${project.title} | Projekty | Noir Architekci`;
                    res.render("./projects/show", {project: project, currentUser: req.user, header: header});
                
        }
    });
});




router.post("/",upload.single("profile"),function(req, res){
    cloudinary.uploader.upload(req.file.path, function(result) {
        let newProject = new Project({
            title: req.body.title,
            important: req.body.important,
            mainPhoto: result.secure_url,
            status: req.body.status,
            info1: req.body.info1,
            subpageLink: req.body.title.toLowerCase().split(' ').join('-'),
            info2: req.body.info2,
            client: req.body.client,
			year: req.body.year
        });
        Project.create(newProject, function(err, project){
            if(err) {
                console.log(err)
            } else {
                Category.findById(req.body.category, (err, category) => {
                    category.projects.push(project._id);
                    category.save();
                    res.redirect("/projects/" + project.subpageLink);
                })
                
            }
        });
    });
    
});


router.get("/:id/new/picture", isLoggedIn, function(req, res){
    Project.findById(req.params.id, function(err, project){
        if(err){
            console.log(err)
        } else {
            let header = `Dodaj zdjęcie | ${project.title} | Projekty | Noir Architekci`;
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
                Picture.create({link: result.secure_url, type: 'project'}, (err, createdPicture) => {
                    project.gallery.push(createdPicture);
                    project.save();
                    res.redirect("/projects/" + project.subpageLink);
                })
                
            }
        });
    });
    
});

router.get("/:id/edit", isLoggedIn, function(req, res){
    Project.findById(req.params.id, function(err, project){
        if(err) {
            console.log(err);
        } else {
            let header = `Edytuj | ${project.title} | Projekty | Noir Architekci`;
            res.render("./projects/edit", {project: project, header:header});
        }
    });
});
router.get("/:id/edit/brick-picture", isLoggedIn, function(req, res){
    Project.findById(req.params.id, function(err, project){
        if(err){
            console.log(err)
        } else {
            let header = `Edytuj zdjęcie kostkowe | ${project.title} | Projekty | Noir Architekci`;
            res.render("./projects/editBrP", {header: header, project:project})
        }
    })
})



router.post("/:id/edit/brick-picture", upload.single("picture"), function(req, res){
   
    cloudinary.uploader.upload(req.file.path, function(result) {
      
        Project.findById(req.params.id, function(err, project){
            if(err) {
                console.log(err);
            } else {
                
                project.brickPhoto = result.secure_url;
                project.save();
                res.redirect("/projects/" + project.subpageLink);
            }
        });
    });
    
});

router.get("/:id/edit/picture", isLoggedIn, function(req, res){
    Project.findById(req.params.id, function(err, project){
        if(err){
            console.log(err)
        } else {
            let header = `Edytuj zdjęcie główne | ${project.title} | Projekty | Noir Architekci`;
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
                project.mainPhoto = result.secure_url;
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
            updatedProject.subpageLink = updatedProject.title.toLowerCase().split(' ').join('-');
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
    req.flash("error", "Nie masz dostępu do tej strony");
    res.redirect(`/?return_route=${req._parsedOriginalUrl.path}`);
}


module.exports = router
