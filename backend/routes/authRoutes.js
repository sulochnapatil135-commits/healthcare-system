

const express = require('express');
const router = express.Router();

// Import YOUR CONTROLLER (the login/register logic)
const { register, login, getMe } = require('../controllers/authController');
// Import the middleware (the code you just shared, now in middleware/auth.js)
const { auth } = require('../middleware/auth');

// Define the API routes (link to controller functions)
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);

// Export the ROUTER (so server.js can use it)
module.exports = router;