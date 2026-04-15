const express = require('express');
const router = express.Router();
const multer = require('multer');
const iotController = require('../controllers/iotController');

// Multer setup for handling image uploads from ESP32-cam
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Endpoint for RFID scans
router.post('/rfid', iotController.handleRFID);

// Endpoint to fetch recent access logs for dashboard UI
router.get('/logs', iotController.getAccessLogs);

// Endpoint for Fingerprint Authentication
router.post('/fingerprint', iotController.handleFingerprint);

// Endpoint for Face ID Images (from ESP32-Cam)
// Assuming form-data field for image is 'image'
router.post('/face', upload.single('image'), iotController.handleFaceUpload);

// Endpoint for frontend face verification simulation (JSON body)
router.post('/face/simulate', iotController.handleFaceSimulation);

module.exports = router;
