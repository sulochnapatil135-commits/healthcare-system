const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorById, updateDoctorProfile } = require('../controllers/doctorController');
const { auth, isDoctor } = require('../middleware/auth');

router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);
router.put('/profile', auth, isDoctor, updateDoctorProfile);

module.exports = router;