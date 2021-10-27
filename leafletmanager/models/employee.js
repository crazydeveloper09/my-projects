const mongoose = require("mongoose");


const employeeSchema = new mongoose.Schema({
    name: String,
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Company"
    }
});



module.exports = mongoose.model("Employee", employeeSchema);