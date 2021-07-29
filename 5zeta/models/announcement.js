const mongoose = require("mongoose")

let announcementSchema = new mongoose.Schema({
    title: String,
    profile: String,
    description: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    price: Number,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    type: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Type"
    },
    pictures: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Picture"
        }
    ],
    added: {
        type: Date,
        default: Date.now()
    },
    link: String,
    keywords: String
})

module.exports = mongoose.model("Announcement", announcementSchema)