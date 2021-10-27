const mongoose = require("mongoose");

const territorySchema = new mongoose.Schema({
    city: String,
    street: String,
    lastWorked: String,
    number: Number,
    beginNumber: Number,
    endNumber: Number,
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    },
    leaflet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Leaflet"
    },
    type: String,
    taken: String,
    description: String,
});

module.exports = mongoose.model("Territory", territorySchema);