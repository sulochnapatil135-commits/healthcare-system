const { pool } = require('../config/database');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                d.doctor_id,
                d.specialization,
                d.qualification,
                d.experience,
                d.availability,
                d.consultation_fee,
                d.rating,
                u.name,
                u.email,
                u.phone
            FROM doctors d
            JOIN users u ON d.user_id = u.user_id
            ORDER BY d.rating DESC
        `);

        res.json({ doctors: result.rows });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single doctor
exports.getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT 
                d.*,
                u.name,
                u.email,
                u.phone
            FROM doctors d
            JOIN users u ON d.user_id = u.user_id
            WHERE d.doctor_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor not found' });
        }

        res.json({ doctor: result.rows[0] });
    } catch (error) {
        console.error('Get doctor error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update doctor profile
exports.updateDoctorProfile = async (req, res) => {
    try {
        const { specialization, qualification, experience, availability, consultation_fee } = req.body;

        const result = await pool.query(`
            UPDATE doctors 
            SET specialization = $1, qualification = $2, experience = $3, 
                availability = $4, consultation_fee = $5
            WHERE user_id = $6
            RETURNING *
        `, [specialization, qualification, experience, availability, consultation_fee, req.user.user_id]);

        res.json({ message: 'Profile updated successfully', doctor: result.rows[0] });
    } catch (error) {
        console.error('Update doctor error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};