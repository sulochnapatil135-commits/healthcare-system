const { pool } = require('../config/database');

// Book appointment
console.log("✅ appointmentController.js is LOADED!");

exports.bookAppointment = async (req, res) => {
    try {
        const { doctor_id, appointment_date, appointment_time, notes } = req.body;
        const patient_id = req.user.user_id;

        if (!doctor_id || !appointment_date || !appointment_time) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        // Check if slot is available
        const existingAppointment = await pool.query(
            `SELECT * FROM appointments 
             WHERE doctor_id = $1 AND appointment_date = $2 AND appointment_time = $3 AND status != 'cancelled'`,
            [doctor_id, appointment_date, appointment_time]
        );

        if (existingAppointment.rows.length > 0) {
            return res.status(400).json({ error: 'This time slot is already booked' });
        }

        // Generate video call link (simple room ID)
        const video_link = `https://meet.jit.si/healthcare-${Date.now()}-${doctor_id}-${patient_id}`;

        const result = await pool.query(
            `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes, video_link, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [patient_id, doctor_id, appointment_date, appointment_time, notes || '', video_link, 'scheduled']
        );

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment: result.rows[0]
        });
    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get patient appointments
exports.getPatientAppointments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.*,
                u.name as doctor_name,
                d.specialization,
                d.consultation_fee,
                u.phone as doctor_phone
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.doctor_id
            JOIN users u ON d.user_id = u.user_id
            WHERE a.patient_id = $1
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `, [req.user.user_id]);

        res.json({ appointments: result.rows });
    } catch (error) {
        console.error('Get patient appointments error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get doctor appointments
exports.getDoctorAppointments = async (req, res) => {
    try {
        // Get doctor_id from user_id
        const doctorResult = await pool.query('SELECT doctor_id FROM doctors WHERE user_id = $1', [req.user.user_id]);
        
        if (doctorResult.rows.length === 0) {
            return res.status(404).json({ error: 'Doctor profile not found' });
        }

        const doctor_id = doctorResult.rows[0].doctor_id;

        const result = await pool.query(`
            SELECT 
                a.*,
                u.name as patient_name,
                u.email as patient_email,
                u.phone as patient_phone
            FROM appointments a
            JOIN users u ON a.patient_id = u.user_id
            WHERE a.doctor_id = $1
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `, [doctor_id]);

        res.json({ appointments: result.rows });
    } catch (error) {
        console.error('Get doctor appointments error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointment_id } = req.params;
        const { status } = req.body;

        if (!['scheduled', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(
            `UPDATE appointments SET status = $1 WHERE appointment_id = $2 RETURNING *`,
            [status, appointment_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.json({ message: 'Status updated successfully', appointment: result.rows[0] });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const { appointment_id } = req.params;

        const result = await pool.query(
            `UPDATE appointments SET status = 'cancelled' WHERE appointment_id = $1 AND patient_id = $2 RETURNING *`,
            [appointment_id, req.user.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
console.log("✅ bookAppointment export type:", typeof exports.bookAppointment)