const express = require("express"),
    Category = require("../models/category"),
    Project = require("../models/project");
    app = express(),
    methodOverride = require("method-override"),
    flash = require("connect-flash"),
    router = express.Router();


app.use(flash());
app.use(methodOverride("_method"));

router.get("/add", isLoggedIn, (req, res) => {
    let header = "Dodaj kategorię | Projekty | Noir Architekci";
    res.render("./category/new", {
        header: header, 
        currentUser: req.user
    })
})

router.post("/", isLoggedIn, (req, res) => {
    let newCategory = new Category({
        name: req.body.name, 
        important: req.body.important,
        info: req.body.info
        
    })
    Category.create(newCategory, (err, createdCategory) => {
        if(err){
            console.log(err);
        } else {
			createdCategory.link = req.body.name.toLowerCase().split(' ').join('-');
			createdCategory.save();
            res.redirect("/");
        }
    })
})

router.get("/:id/edit", isLoggedIn, (req, res) => {
    Category.findById(req.params.id, (err, category) => {
        if(err){
            console.log(err);
        } else {
            let header = `Edytuj kategorię ${category.name} | Noir Architekci`;
            res.render("./category/edit", {
                category:category,
                header: header, 
                currentUser: req.user
            })
        }
    })
    
})

router.put("/:id", isLoggedIn, (req, res) => {
    Category.findByIdAndUpdate(req.params.id, req.body.category, (err, updatedCategory) => {
        if(err){
            console.log(err);
        } else {
			
			updatedCategory.link = updatedCategory.name.toLowerCase().split(' ').join('-');
            updatedCategory.save();
			
            
            res.redirect(`/projects/category/${updatedCategory.link}`)
        }
    })
})

router.get("/:id/delete", isLoggedIn, (req, res) => {
    Category.findByIdAndRemove(req.params.id, (err, updatedCategory) => {
        if(err){
            console.log(err);
        } else {
            res.redirect(`/projects`)
        }
    })
})

router.get("/:id", (req, res) => {
    Category.findOne({link: req.params.id}).populate("projects").exec((err, category) => {
        if(err){
            console.log(err);
        } else {
            Category.find({}, (err,otherCategories) => {
                if(err){
                    console.log(err)
                } else {
					
                    
                    let header = `${category.nameEn} | Projekty | Noir Architekci`
                    res.render("./category/show", {
                        otherCategories:otherCategories,
                        category:category,
                        header: header, 
                        currentUser: req.user, 
                        my:""})
                }
            })
           
        }
    })
   
})

router.get("/:category_id/addP", isLoggedIn, (req, res) => {
    Project.find({categories: {$ne: req.params.category_id}}, (err,projects) => {
        if(err){
            console.log(err)
        } else {
            Category.findById(req.params.category_id, (err, category) => {
                if(err){
                    console.log(err);
                } else {
                    let header = `Dodaj projekt do kategorii ${category.name} | Noir Architekci`
                    res.render("./category/addP", {
                        category:category,
                        projects: projects,
                        header: header, 
                        currentUser: req.user, 
                        recommended:""
                    })
                }
            })
        }
    })
    
});

router.post("/:category_id/addP", isLoggedIn, (req, res) => {
   
    Project.findById(req.body.project, (err, project) => {
        if(err){
            console.log(err)
        } else {
            Category.findById(req.params.category_id, (err, category) => {
                if(err){
                    console.log(err);
                } else {
                    category.projects.push(project);
                    category.save();
                    project.categories.push(category);
                    project.save();
                    res.redirect(`/projects/category/${category.link}`)
                }
            })
            
        }
    })
})


function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Nie masz dostępu do tej strony");
    res.redirect(`/?return_route=${req._parsedOriginalUrl.path}`);
}


module.exports = router