const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Request OTP endpoint
router.post('/otp/request', authController.requestOTP);

// Verify OTP endpoint
router.post('/otp/verify', authController.verifyOTP);

module.exports = router;
