const express = require("express"),
    router = express.Router(),
    app = express(),
    Category = require("../models/category"),
    User = require("../models/user"),
    Base64              = require("js-base64"),
    Announcement = require("../models/announcement"),
    Type = require("../models/type");

router.get("/categories", (req, res) => {
    Category.find({}).populate("announcements").exec((err, categories) => {
        if(err) {
            res.json(err)
        } else {
            res.json(categories)
        }
    })
})

router.get("/types", (req, res) => {
    Type.find({}).populate("announcements").exec((err, types) => {
        if(err) {
            res.json(err)
        } else {
            res.json(types)
        }
    })
})
router.get("/announcements/:user_id", (req, res) => {
    Announcement
        .find({author: req.params.user_id})
        .sort({added: -1})
        .exec((err, announcements) => {
            if(err) {
                res.json(err)
            } else {
                res.json(announcements)
            }
        })
})

router.get("/username/verification", (req, res) => {
    User.findOne({username: req.query.username}, (err, user) => {
        if(err) {
            res.json(err);
        } else {
            res.json(user);
        }
    })
})

router.get("/email/verification", (req, res) => {
    User.findOne({email: Base64.encode(req.query.email)}, (err, user) => {
        if(err) {
            res.json(err)
        } else {
            res.json(user)
        }
    })
})

module.exports = router;
  

