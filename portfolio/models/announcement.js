const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    pl: String,
    en: String
})

module.exports = mongoose.model("Announcement", announcementSchema);