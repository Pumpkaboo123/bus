const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    isAdmin: { type: Boolean, default: false }, // Role-based access
    bookings: { type: Array, default: [] } 
});

const busSchema = new mongoose.Schema({
    busId: { type: String, unique: true },
    name: String,
    price: Number,
    origin: { type: String, default: '' },
    destination: { type: String, default: '' },
    lat: Number,
    lng: Number,
    seats: [[Number]] 
});

const User = mongoose.model('User', userSchema);
const Bus = mongoose.model('Bus', busSchema);

module.exports = { User, Bus };