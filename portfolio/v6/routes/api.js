const express = require("express"),
    User = require("../models/user"),
    router = express.Router();


router.get("/user", (req, res) => {
    let username = "Admin";
    User.findOne({username: username}).populate("achievements").exec(function(err, user){
        if(err){
            console.log(err);
        } else {
           res.json(user);
        }
    });
})


module.exports = router;