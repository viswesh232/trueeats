const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const settingsRoutes = require('./routes/settingRotes');
// 1. Load environment variables
dotenv.config();

// 2. Connect to Database
connectDB();

const app = express();
const path = require('path');

// 3. MIDDLEWARE (The Filters - Must come FIRST)
app.use(cors()); // Allow cross-origin requests
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json()); // Essential: Translates JSON bodies
app.use(express.urlencoded({ extended: false })); // Translates URL-encoded bodies

// 4. ROUTES (The Doors)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', orderRoutes);
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/settings', settingsRoutes); // New route for settings
// 5. BASE ROUTE
app.get('/', (req, res) => {
    res.send('True Eats API is running...');
});

// 6. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});