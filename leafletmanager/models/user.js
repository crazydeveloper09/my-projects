const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: {
        type: String,
        unique: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Company"
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Employee"
    },
    type: String
})

userSchema.plugin(passportLocalMongoose, {
    
    findByUsername: (model, queryParameters) => model.findOne(queryParameters).populate('company')
});

module.exports = mongoose.model("User", userSchema)