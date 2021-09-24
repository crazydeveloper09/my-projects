const express = require("express"),
    Category = require("../models/category"),
    Project = require("../models/project"),
    User = require("../models/user"),
    router = express.Router();

router.get("/categories", (req, res) => {
    Category.find({}).populate("projects").exec((err, categories) => {
        if(err){
            res.json(err);
        } else {
            res.json(categories);
        }
    })
})

router.get("/category/:category_name", (req, res) => {
    Category.findOne({name: req.params.category_name}).populate("projects").exec((err, category) => {
        if(err){
            res.json(err);
        } else {
            res.json(category);
        }
    })
})

let admin_username = "admin";
router.get("/user", function(req, res){
    User.findOne({username: admin_username}, (err, admin) => {
        res.json(admin)
    });
	
});
module.exports = router