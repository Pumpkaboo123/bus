const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const { User, Bus } = require('./models');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect('mongodb://127.0.0.1:27017/smartTransit')
    .then(async () => {
        console.log("✅ MongoDB Connected");
        await cleanupBlankBuses();
        await seedBuses();
        await seedAdmin();
        startSimulation();
    })
    .catch(err => console.error(err));

// Remove buses with no name or no busId (old blank entries)
async function cleanupBlankBuses() {
    const result = await Bus.deleteMany({
        $or: [
            { name: { $in: [null, ''] } },
            { busId: { $in: [null, ''] } },
            { name: { $exists: false } },
            { busId: { $exists: false } }
        ]
    });
    if (result.deletedCount > 0) {
        console.log(`🧹 Cleaned up ${result.deletedCount} blank bus entries`);
    }
}

async function seedBuses() {
    const defaultBuses = [
        { busId: 'BUS001', name: 'City Express', origin: 'Majestic', destination: 'Electronic City', price: 500, lat: 12.97, lng: 77.59, seats: Array(6).fill().map(() => [1, 1, 0, 1, 1]) },
        { busId: 'BUS002', name: 'Metro Liner', origin: 'Indiranagar', destination: 'Whitefield', price: 750, lat: 12.95, lng: 77.60, seats: Array(6).fill().map(() => [1, 1, 0, 1, 1]) }
    ];
    for (const bus of defaultBuses) {
        const exists = await Bus.findOne({ busId: bus.busId });
        if (!exists) {
            await Bus.create(bus);
            console.log(`🚌 Seeded bus: ${bus.name}`);
        }
    }
}

async function seedAdmin() {
    const exists = await User.findOne({ username: 'admin' });
    if (!exists) {
        await User.create({ username: 'admin', password: 'admin123', email: 'admin@smarttransit.com', phone: '0000000000', isAdmin: true, bookings: [] });
        console.log('👑 Default admin created (admin / admin123)');
    }
}

// SIMULATE LIVE TRACKING
function startSimulation() {
    console.log('📡 Starting live bus tracking simulation...');
    setInterval(async () => {
        try {
            const buses = await Bus.find({});
            for (let bus of buses) {
                // Increased movement so it's VERY visible (approx 200 meters)
                const latDelta = (Math.random() - 0.5) * 0.002;
                const lngDelta = (Math.random() - 0.5) * 0.002;
                
                // Keep buses within Bangalore roughly tracking bounds
                let newLat = bus.lat + latDelta;
                let newLng = bus.lng + lngDelta;
                
                if (newLat > 13.1 || newLat < 12.8) newLat = 12.97;
                if (newLng > 77.8 || newLng < 77.4) newLng = 77.59;

                await Bus.updateOne({ busId: bus.busId }, { lat: newLat, lng: newLng });
            }
            
            // Broadcast new locations
            const updatedBuses = await Bus.find({});
            io.emit('bus_locations_updated', updatedBuses.map(b => ({ busId: b.busId, lat: b.lat, lng: b.lng })));
            // console.log(`📍 Emitted new locations for ${updatedBuses.length} buses`); // Uncomment to debug server ticks
        } catch (err) {
            console.error('Simulation error:', err);
        }
    }, 3000); // Trigger every 3 seconds
}

io.on('connection', (socket) => {
    console.log('🔌 New socket connected:', socket.id);

    // AUTH LOGIC
    socket.on('register', async (data) => {
        console.log('📝 Register attempt:', data);
        try {
            const newUser = await User.create({
                username: data.username,
                password: data.password,
                email: data.email || '',
                phone: data.phone || '',
                bookings: []
            });
            console.log('✅ User registered:', newUser.username);
            socket.emit('auth_success', newUser);
        } catch (e) {
            console.error('❌ Register error:', e.message);
            socket.emit('auth_error', e.code === 11000 ? 'Username already exists' : e.message);
        }
    });

    socket.on('login', async (data) => {
        console.log('🔑 Login attempt for:', data.username);
        const user = await User.findOne({ username: data.username, password: data.password });
        if (user) {
            console.log('✅ Login successful:', user.username);
            socket.emit('auth_success', user);
            socket.emit('user_tickets_list', user.bookings || []);
        } else {
            console.log('❌ Login failed for:', data.username);
            socket.emit('auth_error', 'Login Failed');
        }
    });

    // ADMIN LOGIC
    socket.on('admin_add_bus', async (busData) => {
        try {
            // Auto-generate busId if not provided or just force unique one
            const generatedId = `BUS-${Date.now().toString().slice(-6)}`;
            console.log('🚌 Adding new bus:', busData.name, 'with ID:', generatedId);
            
            const newBus = new Bus({
                ...busData,
                busId: generatedId,
                seats: Array(6).fill().map(() => [1, 1, 0, 1, 1])
            });
            await newBus.save();
            const allBuses = await Bus.find({});
            io.emit('bus_data_updated', allBuses);
        } catch (e) {
            socket.emit('admin_error', e.code === 11000 ? 'Bus ID already exists' : e.message);
        }
    });

    socket.on('admin_delete_bus', async (busId) => {
        await Bus.deleteOne({ busId });
        const allBuses = await Bus.find({});
        io.emit('bus_data_updated', allBuses);
        console.log(`🗑️ Bus deleted: ${busId}`);
    });

    socket.on('admin_update_bus', async ({ busId, updates }) => {
        const updateFields = {};
        if (updates.name !== undefined) updateFields.name = updates.name;
        if (updates.origin !== undefined) updateFields.origin = updates.origin;
        if (updates.destination !== undefined) updateFields.destination = updates.destination;
        if (updates.price !== undefined) updateFields.price = Number(updates.price);
        if (updates.lat !== undefined) updateFields.lat = Number(updates.lat);
        if (updates.lng !== undefined) updateFields.lng = Number(updates.lng);
        await Bus.updateOne({ busId }, updateFields);
        const allBuses = await Bus.find({});
        io.emit('bus_data_updated', allBuses);
    });

    socket.on('admin_get_users', async () => {
        console.log('👥 Admin requested user list');
        const users = await User.find({}, { password: 0 });
        socket.emit('admin_users_list', users);
        console.log('📤 Sent user list, count:', users.length);
    });

    socket.on('admin_delete_user', async (username) => {
        await User.deleteOne({ username });
        const users = await User.find({}, { password: 0 });
        socket.emit('admin_users_list', users);
        console.log(`🗑️ User deleted: ${username}`);
    });

    socket.on('admin_toggle_admin', async (username) => {
        console.log('🔄 Request to toggle admin for:', username);
        const user = await User.findOne({ username });
        if (user) {
            user.isAdmin = !user.isAdmin;
            await user.save();
            console.log(`✅ Toggled admin for: ${username} -> ${user.isAdmin}`);
            const users = await User.find({}, { password: 0 });
            socket.emit('admin_users_list', users);
        } else {
            console.error('❌ User not found for admin toggle:', username);
        }
    });

    // BOOKING LOGIC
    socket.on('get_bus_seats', async (busId) => {
        const bus = await Bus.findOne({ busId });
        if (bus) socket.emit('initial_seats', { busId, seats: bus.seats });
    });

    socket.on('book_seats', async (data) => {
        const { busId, selectedSeats, username, busName, total, bookingId } = data;
        const bus = await Bus.findOne({ busId });
        selectedSeats.forEach(id => {
            const [r, c] = id.split('-').map(Number);
            bus.seats[r][c] = 2;
        });
        await Bus.updateOne({ busId }, { seats: bus.seats });
        await User.updateOne({ username }, { $push: { bookings: { ...data, seats: selectedSeats.join(', ') } } });
        io.emit('update_seats', { busId, updatedMap: bus.seats });
        const user = await User.findOne({ username });
        socket.emit('user_tickets_list', user.bookings);
    });

    socket.on('cancel_seats', async (data) => {
        const { busId, seatsToCancel, username, bookingId } = data;
        const bus = await Bus.findOne({ busId });
        seatsToCancel.forEach(id => {
            const [r, c] = id.split('-').map(Number);
            bus.seats[r][c] = 1;
        });
        await Bus.updateOne({ busId }, { seats: bus.seats });
        await User.updateOne({ username }, { $pull: { bookings: { bookingId } } });
        io.emit('update_seats', { busId, updatedMap: bus.seats });
        const user = await User.findOne({ username });
        socket.emit('user_tickets_list', user.bookings);
    });
});

app.get('/api/buses', async (req, res) => {
    const buses = await Bus.find({});
    res.json(buses);
});

server.listen(3001);