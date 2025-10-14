const express = require('express');
const router = express.Router();
const {
    bookAppointment,
    getPatientAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    cancelAppointment
 
} = require('../controllers/appointmentController');
const { auth, isPatient, isDoctor } = require('../middleware/auth');

router.post('/book', auth, isPatient, bookAppointment);
router.get('/patient', auth, isPatient, getPatientAppointments);
router.get('/doctor', auth, isDoctor, getDoctorAppointments);
router.put('/:appointment_id/status', auth, updateAppointmentStatus);
router.delete('/:appointment_id/cancel', auth, isPatient, cancelAppointment);
module.exports = router;