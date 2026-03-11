const mongoose = require('mongoose');
const { Bus } = require('./models');

mongoose.connect('mongodb://127.0.0.1:27017/smartTransit')
    .then(async () => {
        console.log("Connected to DB for seeding...");
        await Bus.deleteMany({}); // Clear existing data

        const busData = [
            { 
                busId: "KSRTC-101", 
                seats: Array(6).fill().map(() => [1, 1, 0, 1, 1]) // 1 = Available, 0 = Aisle
            },
            { 
                busId: "PVT-202", 
                seats: Array(6).fill().map(() => [1, 1, 0, 1, 1]) 
            }
        ];

        await Bus.insertMany(busData);
        console.log("✅ Buses initialized in Database!");
        process.exit();
    })
    .catch(err => console.log(err));