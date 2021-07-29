const mongoose = require("mongoose");


const commentSchema = new mongoose.Schema({
    author: String,
    text: {
        type: String,
        required: true
    },
    written: {
        type: Date,
        default: Date.now()
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },
    stars: Number
});

module.exports = mongoose.model("Comment", commentSchema);