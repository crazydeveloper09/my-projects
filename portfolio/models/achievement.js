const mongoose = require("mongoose");

const achievementsSchema = new mongoose.Schema({
    title:String,
    titleEn: String,
    picture: String
});

module.exports = mongoose.model("Achievement", achievementsSchema);