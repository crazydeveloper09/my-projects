const mongoose = require("mongoose");

const preacherSchema = new mongoose.Schema({
    name: String,
    congregation: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Congregation"
    }
});

module.exports = mongoose.model("Preacher", preacherSchema);