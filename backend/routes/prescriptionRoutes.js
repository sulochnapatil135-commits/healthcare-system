const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    uploadPrescription,
    getPrescriptions,
    downloadPrescription
   
} = require('../controllers/prescriptionController');
const { auth, isDoctor } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir+'/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'prescription-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF and image files are allowed'));
        }
    }
});

router.post('/upload', auth, isDoctor, upload.single('prescription'), uploadPrescription);
router.get('/:appointment_id', auth, getPrescriptions);
router.get('/download/:prescription_id', auth, downloadPrescription); 

module.exports = router;