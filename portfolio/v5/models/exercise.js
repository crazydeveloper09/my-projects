const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
    title: String,
    profile: String,
    link: String
}); 

module.exports = mongoose.model("Exercise", exerciseSchema);