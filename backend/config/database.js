const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('✅ Database connected');
});

pool.on('error', (err) => {
    console.error('❌ Database error:', err);
});

// Initialize database tables
const initDatabase = async () => {
    try {
        // Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL CHECK(role IN ('doctor','patient')),
                phone VARCHAR(20),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Doctors table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS doctors (
                doctor_id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                specialization VARCHAR(255),
                qualification VARCHAR(255),
                experience INTEGER,
                availability TEXT,
                consultation_fee DECIMAL(10,2),
                rating DECIMAL(3,2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Appointments table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS appointments (
                appointment_id SERIAL PRIMARY KEY,
                patient_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
                appointment_date DATE NOT NULL,
                appointment_time TIME NOT NULL,
                status VARCHAR(50) DEFAULT 'scheduled' CHECK(status IN ('scheduled','completed','cancelled')),
                video_link TEXT,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Prescriptions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS prescriptions (
                prescription_id SERIAL PRIMARY KEY,
                appointment_id INTEGER NOT NULL REFERENCES appointments(appointment_id) ON DELETE CASCADE,
                file_path TEXT NOT NULL,
                file_name TEXT NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database tables initialized');

        // Seed demo data if tables are empty
        const { rows } = await pool.query('SELECT COUNT(*) as count FROM users');
        if (parseInt(rows[0].count) === 0) {
            await seedDemoData();
        }
    } catch (error) {
        console.error('❌ Database initialization error:', error);
        throw error;
    }
};

// Seed demo data
const seedDemoData = async () => {
    const bcrypt = require('bcryptjs');
    
    try {
        // Create demo doctor
        const docPassword = await bcrypt.hash('doctor123', 10);
        const doctorResult = await pool.query(
            `INSERT INTO users (name, email, password, role, phone) 
             VALUES ($1, $2, $3, $4, $5) RETURNING user_id`,
            ['Dr. Sarah Johnson', 'doctor@healthcare.com', docPassword, 'doctor', '9876543210']
        );

        await pool.query(
            `INSERT INTO doctors (user_id, specialization, qualification, experience, availability, consultation_fee, rating) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [doctorResult.rows[0].user_id, 'Cardiologist', 'MBBS, MD (Cardiology)', 10, 'Mon-Fri: 9AM-5PM', 500, 4.8]
        );

        // Create demo doctor 2
        const doc2Result = await pool.query(
            `INSERT INTO users (name, email, password, role, phone) 
             VALUES ($1, $2, $3, $4, $5) RETURNING user_id`,
            ['Dr. Michael Chen', 'doctor2@healthcare.com', docPassword, 'doctor', '9876543211']
        );

        await pool.query(
            `INSERT INTO doctors (user_id, specialization, qualification, experience, availability, consultation_fee, rating) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [doc2Result.rows[0].user_id, 'Neurologist', 'MBBS, MD (Neurology)', 8, 'Mon-Sat: 10AM-6PM', 600, 4.9]
        );

        // Create demo patient
        const patPassword = await bcrypt.hash('patient123', 10);
        await pool.query(
            `INSERT INTO users (name, email, password, role, phone) 
             VALUES ($1, $2, $3, $4, $5)`,
            ['John Doe', 'patient@healthcare.com', patPassword, 'patient', '9876543212']
        );

        console.log('✅ Demo data seeded');
        console.log('   Doctor: doctor@healthcare.com / doctor123');
        console.log('   Patient: patient@healthcare.com / patient123');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

module.exports = { pool, initDatabase };