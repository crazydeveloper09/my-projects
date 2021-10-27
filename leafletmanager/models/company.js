const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    name: String,
    territories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Territory"
        }
    ],
    employees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee"
        }
    ]

})

module.exports = mongoose.model("Company", companySchema);