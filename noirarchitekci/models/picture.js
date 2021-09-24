const mongoose = require("mongoose");

let pictureSchema = new mongoose.Schema({
    link: String,
    type: String
    
})

module.exports = mongoose.model("Picture", pictureSchema)