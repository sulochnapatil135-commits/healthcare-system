const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

// Register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone, specialization, qualification, experience, consultationFee } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (name, email, password, role, phone) 
             VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, email, role`,
            [name, email, hashedPassword, role, phone || null]
        );

        const user = result.rows[0];

        // If doctor, add to doctors table
        if (role === 'doctor') {
            await pool.query(
                `INSERT INTO doctors (user_id, specialization, qualification, experience, consultation_fee) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [user.user_id, specialization || '', qualification || '', experience || 0, consultationFee || 0]
            );
        }

        // Generate token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }

        // Find user
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Get doctor_id if user is a doctor
        let doctor_id = null;
        if (user.role === 'doctor') {
            const doctorResult = await pool.query('SELECT doctor_id FROM doctors WHERE user_id = $1', [user.user_id]);
            if (doctorResult.rows.length > 0) {
                doctor_id = doctorResult.rows[0].doctor_id;
            }
        }

        // Generate token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role, doctor_id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                doctor_id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT user_id, name, email, role, phone FROM users WHERE user_id = $1',
            [req.user.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};