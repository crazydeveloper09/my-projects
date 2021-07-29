const express = require("express"),
    router              = express.Router(),
    app                 = express(),
    Type                = require("../models/type"),
    Announcement        = require("../models/announcement"),
    flash               = require("connect-flash"),
    atob                = require("atob"),
    btoa                = require("btoa"),
    methodOverride      = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))

router.get("/", isAdminLoggedIn, (req, res) => {
    Type.find({}, (err, types) => {
        if(err){
            console.log(err)
        } else {
            let header = `Wszystkie stany | 5zeta`;
            res.render("./type/index", {
                header: header,
                currentUser: req.user,
                types: types
            });
        }
    })
   
})

router.get("/new", isAdminLoggedIn, (req, res) => {
     let header = `Dodaj stany | 5zeta`;
    res.render("./type/new", {
        header: header
    })
})

router.post("/", isAdminLoggedIn, (req, res) => {
    let newtype = new Type({
        title: req.body.title,
        link: req.body.title.toLowerCase().split(' ').join('-')
    })
    Type.create(newtype, (err, createdtype) => {
        if(err){
            console.log(err)
        } else {
            res.redirect("/announcements/type/")
        }
    })
})

router.get("/:type_link", (req, res) => {
    Type.findOne({link: req.params.type_link}, (err, type) => {
        if(err){
            console.log(err)
        } else {
            Announcement
                .find({type: type._id})
                .populate(["category", "author"])
                .sort({added: -1})
                .exec((err, announcements) => {
                    let header = `Ogłoszenia dla typu ${type.title} | 5zeta`;
                    res.render("./type/show", {
                        header: header,
                        type: type,
                        announcements: announcements,
                        logged: req.user
                    })
                })
        }
    })
})

router.get("/:type_link/search", (req, res) => {
    const regex = new RegExp(escapeRegex(req.query.title), 'gi');
    Type.findOne({link: req.params.type_link}, (err, type) => {
        if(err){
            console.log(err)
        } else {
            Announcement
                .find({ $and:[{type: type._id}, {title: regex}]})
                .populate(["category", "author"])
                .sort({added: -1})
                .exec((err, announcements) => {
                    let header = `Wyszukiwanie ogłoszeń dla typu ${type.title} | 5zeta`;
                    res.render("./type/search", {
                        header: header,
                        type: type,
                        announcements: announcements,
                        param: req.query.title,
                        logged: req.user
                    })
                })
        }
    })
})

router.get("/:type_link/search/advanced", (req, res) => {
    Type.findOne({link: req.params.type_link}, (err, type) => {
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
                            {type: req.query.type_id},
                            {price: {$gte: req.query.price}}
                        ]
                    })
                    .populate(["category", "author"])
                    .sort({added: -1})
                    .exec((err, announcements) => {
                        if(err){
                            console.log(err);
                        } else {
                            let header = `Zaawansowane wyszukiwanie ogłoszeń w typie ${type.title} | 5zeta`;
                            res.render("./type/advanced", {
                                header: header,
                                announcements: announcements,
                                params: params,
                                type: type,
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
                            {type: req.query.type_id},
                            {price: {$lte: req.query.price}}
                        ]
                    })
                    .populate(["category", "author"])
                    .sort({added: -1})
                    .exec((err, announcements) => {
                        if(err){
                            console.log(err);
                        } else {
                            let header = `Zaawansowane wyszukiwanie ogłoszeń w typie ${type.title} | 5zeta`;
                            res.render("./type/advanced", {
                                header: header,
                                announcements: announcements,
                                params: params,
                                type: type,
                                logged: req.user
                            })
                        }
                    })
            }
        }
        
    })
    
})

router.get("/:type_id/edit", isAdminLoggedIn, (req, res) => {
    Type.findById(req.params.type_id, (err, type) => {
        if(err){
            console.log(err)
        } else {
            let header = `Edytuj kategorię ${type.title} | 5zeta`;
            res.render("./type/edit", {
                header: header,
                currentUser: req.user,
                type: type
            });
        }
    })
   
})

router.put("/:type_id", isAdminLoggedIn, (req, res) => {
    Type.findByIdAndUpdate(req.params.type_id, req.body.type, (err, updatedtype) => {
        if(err){
            console.log(err)
        } else {
            updatedtype.link = req.body.type.title.toLowerCase().split(' ').join('-');
            updatedtype.save();
            res.redirect("/announcements/type")
        }
    })
})

router.get("/:type_id/delete", isAdminLoggedIn, (req, res) => {
    Type.findByIdAndDelete(req.params.type_id, (err, deletedtype) => {
        if(err){
            console.log(err)
        } else {
           
            res.redirect("/announcements/type")
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