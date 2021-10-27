const express = require("express"),
    router              = express.Router({mergeParams: true}),
    app                 = express(),
    flash               = require("connect-flash"),
    methodOverride      = require("method-override");

app.use(flash());
app.use(methodOverride("_method"))

router.get("/", function(req, res){
	res.render("landing");
});

router.get("/policy", function(req, res){
    let header = "Polityka prywatności | Leaflet Manager"
	res.render("policy", {header: header});
});


router.get("/support", function(req, res){
    let header = "Wsparcie | Leaflet Manager"
	res.render("support", {header: header});
});





module.exports = router;