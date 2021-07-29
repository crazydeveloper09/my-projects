const mongoose = require("mongoose");

let typeSchema = new mongoose.Schema({
    title: String,
    announcements: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Announcement"
        }
    ],
    link: String
})

module.exports = mongoose.model("Type", typeSchema)