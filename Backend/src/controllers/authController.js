const { db } = require('../config/firebase');
const { addLog } = require('../services/logStore');

exports.requestOTP = async (req, res, next) => {
    try {
        const { phoneOrEmail } = req.body;
        if (!phoneOrEmail) {
            return res.status(400).json({ error: 'Phone number or email is required' });
        }

        // Simulate OTP generation
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        console.log(`Simulated OTP for ${phoneOrEmail} is ${otp}`);
        
        if (db) {
            // Store OTP in database with expiration (5 minutes)
            await db.collection('otps').doc(phoneOrEmail).set({
                otp,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 5 * 60000)
            });
        }

        const payload = {
            success: true,
            message: 'OTP requested successfully'
        };

        if (process.env.NODE_ENV !== 'production') {
            payload.developmentOtp = otp;
        }

        res.status(200).json(payload);
    } catch (error) {
        next(error);
    }
};

exports.verifyOTP = async (req, res, next) => {
    try {
        const { phoneOrEmail, otp } = req.body;
        if (!phoneOrEmail || !otp) {
            return res.status(400).json({ error: 'Phone/Email and OTP are required' });
        }

        if (db) {
            const doc = await db.collection('otps').doc(phoneOrEmail).get();
            if (!doc.exists) {
                return res.status(401).json({ success: false, error: 'OTP request not found or expired' });
            }

            const data = doc.data();
            if (data.otp !== otp) {
                return res.status(401).json({ success: false, error: 'Invalid OTP' });
            }

            // Valid
            await doc.ref.delete();
            await db.collection('accessLogs').add({
                method: 'OTP',
                identifier: phoneOrEmail,
                timestamp: new Date(),
                status: 'success'
            });

            addLog({
                method: 'OTP',
                user: phoneOrEmail,
                status: 'success',
                location: 'Guest Access',
                deviceId: 'dashboard-client'
            });

            return res.status(200).json({ success: true, message: 'OTP verified successfully' });
        } else {
            console.log(`Verifying offline OTP: ${otp} for ${phoneOrEmail}`);
            addLog({
                method: 'OTP',
                user: phoneOrEmail,
                status: 'success',
                location: 'Guest Access',
                deviceId: 'dashboard-client'
            });
            res.status(200).json({ success: true, message: 'OTP verified (offline simulation)' });
        }

    } catch (error) {
        next(error);
    }
};
