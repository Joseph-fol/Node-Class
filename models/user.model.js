const mongoose = require("mongoose")

let customerSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: [true, 'Email has been taken, please choose another one'] },
    // phoneNumber: {type: String, required: [true, 'User phone number is required']},
    password: { type: String, required: true }
})

const Customer = mongoose.model('customer', customerSchema)
module.exports = Customer;
