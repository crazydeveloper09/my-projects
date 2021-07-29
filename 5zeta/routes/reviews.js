const express = require("express"),
    router              = express.Router({mergeParams: true}),
    app                 = express(),
    Review                = require("../models/reviews"),
    User        = require("../models/user"),
    flash               = require("connect-flash"),
    atob                = require("atob"),
    btoa                = require("btoa"),
    methodOverride      = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))



router.get("/new", (req, res) => {
    User.findOne({username: req.params.user_username}, (err, user) => {
        if(err){
            console.log(err);
        } else {
            let header = `Dodaj opinię do użytkownika ${user.username} | 5zeta`;
            res.render("./reviews/new", {
                header: header,
                currentUser: req.user,
                user: user
            })
        }
    })
    
})

router.post("/", (req, res) => {
    User.findOne({username: req.params.user_username}, (err, user) => {
        if(err){
            console.log(err);
        } else {
            let logged;
            let author;
            if(req.user){
                logged = "użytkownik portalu";
                author = req.user.name;
               
            } else {
                logged = "osoba spoza portalu";
                author = req.body.name;
            }
            let newReview = new Review({
                picture: `rgb(${Math.round(Math.random()*256)}, ${Math.round(Math.random()*256)}, ${Math.round(Math.random()*256)})`,
                author: author,
                logged: logged,
                user: user._id,
                stars: req.body.stars,
                text: req.body.text
            })
            Review.create(newReview, (err, createdReview) => {
                if(err){
                    console.log(err)
                } else {
                    res.redirect(`/user/${user.username}/info`)
                }
            })
        }
    })
    
})




router.get("/:review_id/delete", (req, res) => {
    User.findOne({username: req.params.user_username}, (err, user) => {
        if(err){
            console.log(err);
        } else {
            if(req.user){
                if(req.user.username === user.username){
                    Review.findByIdAndDelete(req.params.review_id, (err, deletedReview) => {
                        if(err){
                            console.log(err)
                        } else {
                           
                            res.redirect(`/user/${user.username}/info`)
                        }
                    })
                } else {
                    req.flash("error", "Zaloguj się lub zarejestruj, by móc wykonać tę czynność");
                    res.redirect(`/login`);
                }
            } else {
                req.flash("error", "Zaloguj się lub zarejestruj, by móc wykonać tę czynność");
                res.redirect(`/login`);
            }
           
        }
    })
    
})



function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;