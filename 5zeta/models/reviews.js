const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    picture: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: String,
    author: String,
    logged: String,
    stars: Number,
    published: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("Review", reviewSchema);