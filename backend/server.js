require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initDatabase } = require('./config/database');


const app = express();
const PORT = process.env.PORT || 5432;
const _dirname = path.resolve();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors({
    origin: "https://healthcare-system-q9pj.onrender.com",
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Debug: Check route exports
const authRoutes = require('./routes/authRoutes');
console.log('authRoutes type:', typeof authRoutes); // Should be "function"

const doctorRoutes = require('./routes/doctorRoutes');
console.log('doctorRoutes type:', typeof doctorRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
console.log('appointmentRoutes type:', typeof appointmentRoutes);

const prescriptionRoutes = require('./routes/prescriptionRoutes');
console.log('prescriptionRoutes type:', typeof prescriptionRoutes); // Check this

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: err.message || 'Something went wrong!' });
});
app.use(express.static(path.join(_dirname,"/frontend/build")));
app.get('*',(_,res)=>{
    res.sendFile(path.resolve(_dirname, "frontend", "build","index.html"));
})

// Initialize database and start server
const startServer = async () => {
    try {
        await initDatabase();
        
        app.listen(PORT, () => {
            console.log('\n🏥 Healthcare Appointment System Backend');
            console.log('==========================================');
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Database: ${process.env.DB_NAME}`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log('==========================================\n');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});