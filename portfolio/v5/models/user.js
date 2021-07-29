const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    about: String,
    en: String,
    email:String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    fbLink: String,
    fbDesc: String,
    igLink: String,
    igDesc: String,
    achievements: [ 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Achievement"
        } 
    ]
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);