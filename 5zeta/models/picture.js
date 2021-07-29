const mongoose = require("mongoose");

let pictureSchema = new mongoose.Schema({
    source: String
})

module.exports = mongoose.model("Picture", pictureSchema)