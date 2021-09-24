const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    username: String,
    password: String,
    photo: String,
    email: String,
    phone: String,
    important: String,
    info1: String,
    info2: String,
    location: String,
    facebook: String,
    instagram: String,
    street: String,
    city: String,
    postCode: String,
    lat: Number,
    lng: Number
})

userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", userSchema)