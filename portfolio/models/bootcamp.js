const mongoose = require("mongoose");

const bootcampSchema = new mongoose.Schema({
    title: String,
    profile: String,
    instructor: String,
    progress: Number,
    link: String,
    subpageLink: String,
    exercises: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exercise"
        }
    ]
});


module.exports = mongoose.model("Bootcamp", bootcampSchema)