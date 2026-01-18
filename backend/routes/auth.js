const express = require('express');
const router = express.Router();
const { sendOTPController, verifyOTPController, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/send-otp', sendOTPController);
router.post('/verify-otp', verifyOTPController);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
