// file: app.js atau server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Impor sequelize untuk otentikasi koneksi database
const { sequelize } = require('./models'); 

// Import routes
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();
// PORT diubah menjadi 3001
const PORT = process.env.PORT || 3009; 

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Middleware sederhana untuk logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- ROUTES ---
// Root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to WishMate API Home Page');
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);

// --- ERROR HANDLING & SERVER START ---

// 1. 404 Handler (Endpoint tidak ditemukan)
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
});

// 2. Global Error Handler (Untuk error 500)
app.use((err, req, res, next) => {
    console.error('❌ Server Error Stack:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

/**
 * Database Connection & Server Start Function
 */
const startServer = async () => {
    try {
        // Cek koneksi DB
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Jalankan server
        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;