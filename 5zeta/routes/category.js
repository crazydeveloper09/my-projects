const express = require("express"),
    router = express.Router(),
    app = express(),
    Category = require("../models/category"),
    Announcement = require("../models/announcement"),
    flash = require("connect-flash"),
    atob                = require("atob"),
    btoa                = require("btoa"),
    methodOverride = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))

router.get("/", isAdminLoggedIn, (req, res) => {
    Category.find({}, (err, categories) => {
        if(err){
            console.log(err)
        } else {
            let header = `Wszystkie kategorie | 5zeta`;
            res.render("./category/index", {
                header: header,
                currentUser: req.user,
                categories: categories
            });
        }
    })
   
})

router.get("/new", isAdminLoggedIn, (req, res) => {
     let header = `Dodaj kategorię | 5zeta`;
    res.render("./category/new", {
        header: header
    })
})

router.post("/", isAdminLoggedIn, (req, res) => {
    let newCategory = new Category({
        title: req.body.title,
        link: req.body.title.toLowerCase().split(' ').join('-')
    })
    Category.create(newCategory, (err, createdCategory) => {
        if(err){
            conosle.log(err)
        } else {
            res.redirect("/announcements/category/")
        }
    })
})

router.get("/:category_link", (req, res) => {
    Category.findOne({link: req.params.category_link}, (err, category) => {
        if(err){
            console.log(err)
        } else {
            Announcement
                .find({category: category._id})
                .populate(["category", "author"])
                .sort({added: -1})
                .exec((err, announcements) => {
                    let header = `Ogłoszenia dla kategorii ${category.title} | 5zeta`;
                    res.render("./category/show", {
                        header: header,
                        category: category,
                        announcements: announcements,
                        logged: req.user
                    })
                })
        }
    })
})

router.get("/:category_link/search", (req, res) => {
    const regex = new RegExp(escapeRegex(req.query.title), 'gi');
    Category.findOne({link: req.params.category_link}, (err, category) => {
        if(err){
            console.log(err)
        } else {
            Announcement
                .find({ $and:[{category: category._id}, {title: regex}]})
                .populate(["category", "author"])
                .sort({added: -1})
                .exec((err, announcements) => {
                    let header = `Wyszukiwanie ogłoszeń dla kategorii ${category.title} | 5zeta`;
                    res.render("./category/search", {
                        header: header,
                        category: category,
                        announcements: announcements,
                        param: req.query.title,
                        logged: req.user
                    })
                })
        }
    })
})
router.get("/:category_link/search/advanced", (req, res) => {
    Category.findOne({link: req.params.category_link}, (err, category) => {
        if(err){
            console.log(err);
        } else {
          
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
                            {category: req.query.category_id},
                            {price: {$gte: req.query.price}}
                        ]
                    })
                    .populate(["category", "author"])
                    .sort({added: -1})
                    .exec((err, announcements) => {
                        if(err){
                            console.log(err);
                        } else {
                            let header = `Zaawansowane wyszukiwanie ogłoszeń w kategorii ${category.title} | 5zeta`;
                            res.render("./category/advanced", {
                                header: header,
                                announcements: announcements,
                                params: params,
                                category: category,
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
                            {category: req.query.category_id},
                            {price: {$lte: req.query.price}}
                        ]
                    })
                    .populate(["category", "author"])
                    .sort({added: -1})
                    .exec((err, announcements) => {
                        if(err){
                            console.log(err);
                        } else {
                            let header = `Zaawansowane wyszukiwanie ogłoszeń w kategorii ${category.title} | 5zeta`;
                            res.render("./category/advanced", {
                                header: header,
                                announcements: announcements,
                                params: params,
                                category: category,
                                logged: req.user
                            })
                        }
                    })
            }
        }
        
    })
    
})

router.get("/:category_id/edit", isAdminLoggedIn, (req, res) => {
    Category.findById(req.params.category_id, (err, category) => {
        if(err){
            console.log(err)
        } else {
            let header = `Edytuj kategorię ${category.title} | 5zeta`;
            res.render("./category/edit", {
                header: header,
                currentUser: req.user,
                category: category
            });
        }
    })
   
})

router.put("/:category_id", isAdminLoggedIn, (req, res) => {
    Category.findByIdAndUpdate(req.params.category_id, req.body.category, (err, updatedCategory) => {
        if(err){
            console.log(err)
        } else {
            updatedCategory.link = req.body.category.title.toLowerCase().split(' ').join('-');
            updatedCategory.save();
            res.redirect("/announcements/category")
        }
    })
})

router.get("/:category_id/delete", isAdminLoggedIn, (req, res) => {
    Category.findByIdAndDelete(req.params.category_id, (err, deletedCategory) => {
        if(err){
            console.log(err)
        } else {
           
            res.redirect("/announcements/category")
        }
    })
})


function isAdminLoggedIn (req, res, next) {
    if(req.isAuthenticated()) {
        if(atob(req.user.role) === 'admin'){
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