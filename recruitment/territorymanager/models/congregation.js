const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

const congregationSchema = new mongoose.Schema({
    username: String,
    password: String,
    territories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Territory"
        }
    ],
    preachers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Preacher"
        }
    ]
})
congregationSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Congregation", congregationSchema);