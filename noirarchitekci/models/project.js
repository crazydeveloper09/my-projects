const mongoose = require("mongoose");

let projectSchema = new mongoose.Schema({
    title: String,
    important: String,
    info1: String,
    info2: String,
    client: String,
    mainPhoto: String,
    brickPhoto: String,
    status: String,
    year: Number,
    subpageLink: String,
    gallery: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Picture"
        }
    ]
    
})

module.exports = mongoose.model("Project", projectSchema)