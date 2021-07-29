const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    name: String,
    password: String,
    profile: String,
    email: {
        type: String,
        unique: true
    },
    joined: {
        type: Date,
        default: Date.now()
    },
    role: String,
    location: String,
    phone: String,
    lat: Number,
    lng: Number,
    city: String,
    street: String,
    district: String,
    description: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    verificationCode: String,
    verificationExpires: Date,
    verificated: {
        type: Boolean,
        default: false
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reviews"
        }
    ]
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", userSchema)