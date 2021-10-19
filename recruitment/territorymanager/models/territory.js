const mongoose = require("mongoose");

const territorySchema = new mongoose.Schema({
    city: String,
    street: String,
    lastWorked: String,
    number: Number,
    beginNumber: Number,
    endNumber: Number,
    preacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Preacher"
    },
    congregation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Congregation"
    },
    type: String,
    taken: String,
    description: String,
    forbidden: String
});

module.exports = mongoose.model("Territory", territorySchema);