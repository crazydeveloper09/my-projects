const mongoose = require("mongoose");

let categorySchema = new mongoose.Schema({
    title: String,
    announcements: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Announcement"
        }
    ],
    link: String
})

module.exports = mongoose.model("Category", categorySchema)