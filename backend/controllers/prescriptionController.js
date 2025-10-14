const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs');

// Upload prescription
exports.uploadPrescription = async (req, res) => {
    try {
        const { appointment_id } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a file' });
        }

        if (!appointment_id) {
            return res.status(400).json({ error: 'Appointment ID is required' });
        }

        const file_path = `/uploads/${req.file.filename}`;
        const file_name = req.file.originalname;

        const result = await pool.query(
            `INSERT INTO prescriptions (appointment_id, file_path, file_name) 
             VALUES ($1, $2, $3) RETURNING *`,
            [appointment_id, file_path, file_name]
        );

        // Update appointment status to completed
        await pool.query(
            `UPDATE appointments SET status = 'completed' WHERE appointment_id = $1`,
            [appointment_id]
        );

        res.status(201).json({
            message: 'Prescription uploaded successfully',
            prescription: result.rows[0]
        });
    } catch (error) {
        console.error('Upload prescription error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get prescriptions for appointment
exports.getPrescriptions = async (req, res) => {
    try {
        const { appointment_id } = req.params;

        const result = await pool.query(
            `SELECT * FROM prescriptions WHERE appointment_id = $1 ORDER BY uploaded_at DESC`,
            [appointment_id]
        );

        res.json({ prescriptions: result.rows });
    } catch (error) {
        console.error('Get prescriptions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

 //Download prescription
exports.downloadPrescription = async (req, res) => {
    try {
        const { prescription_id } = req.params;

        const result = await pool.query(
            `SELECT * FROM prescriptions WHERE prescription_id = $1`,
            [prescription_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Prescription not found' });
        }

        const prescription = result.rows[0];
        const filePath = path.join(__dirname, '..', prescription.file_path);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.download(filePath, prescription.file_name);
    } catch (error) {
        console.error('Download prescription error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


