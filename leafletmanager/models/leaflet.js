const mongoose = require("mongoose");

const leafletSchema = new mongoose.Schema({
    title: String,
    file: String,
    format: String,
    description: String,
    type: String,
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    }
})

module.exports = mongoose.model("Leaflet", leafletSchema)