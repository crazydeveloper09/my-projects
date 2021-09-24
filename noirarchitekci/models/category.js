const mongoose = require("mongoose");

let categorySchema = new mongoose.Schema({
    name: String,
    important: String,
    info: String,
    link: String,
    projects: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Project"
        }
    ]
})

module.exports = mongoose.model("Category", categorySchema)