const { db, bucket } = require('../config/firebase');
const { addLog, getLogs } = require('../services/logStore');

function normalizeDbTimestamp(value) {
    if (!value) {
        return new Date();
    }

    if (value instanceof Date) {
        return value;
    }

    if (typeof value.toDate === 'function') {
        return value.toDate();
    }

    return new Date(value);
}

function mapDbLog(doc) {
    const data = doc.data();
    return {
        id: doc.id,
        method: data.method || 'Unknown',
        status: data.status || 'success',
        user: data.identifier || data.userId || data.uid || data.fingerprintId || 'unknown',
        deviceId: data.deviceId || 'unknown',
        location: data.location || 'Smart Office',
        timestamp: normalizeDbTimestamp(data.timestamp),
    };
}

exports.handleRFID = async (req, res, next) => {
    try {
        const { uid, deviceId } = req.body;
        if (!uid) {
            return res.status(400).json({ error: 'UID is required' });
        }

        console.log(`Received RFID Scan: ${uid} from device ${deviceId}`);

        addLog({
            method: 'RFID',
            user: uid,
            deviceId: deviceId || 'unknown',
            status: 'pending',
            location: 'Entrance Reader'
        });

        if (db) {
            // Save log to Firestore under 'accessLogs'
            await db.collection('accessLogs').add({
                method: 'RFID',
                uid,
                deviceId: deviceId || 'unknown',
                timestamp: new Date(),
                status: 'pending' // you might want to look this up in the 'users' collection to verify access
            });
        }
        
        // Let ESP32 know the data was received
        res.status(200).json({ success: true, message: 'RFID data logged' });
    } catch (error) {
        next(error);
    }
};

exports.handleFingerprint = async (req, res, next) => {
    try {
        const { fingerprintId, deviceId } = req.body;
        if (!fingerprintId) {
            return res.status(400).json({ error: 'Fingerprint ID is required' });
        }

        console.log(`Received Fingerprint Match: ${fingerprintId} from device ${deviceId}`);

        addLog({
            method: 'Fingerprint',
            user: fingerprintId,
            deviceId: deviceId || 'unknown',
            status: 'success',
            location: 'Main Entrance'
        });

        if (db) {
            await db.collection('accessLogs').add({
                method: 'Fingerprint',
                fingerprintId,
                deviceId: deviceId || 'unknown',
                timestamp: new Date()
            });
        }

        res.status(200).json({ success: true, message: 'Fingerprint data logged' });
    } catch (error) {
        next(error);
    }
};

exports.handleFaceUpload = async (req, res, next) => {
    try {
        const file = req.file;
        const { userId, deviceId } = req.body;

        if (!file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        console.log(`Received Face Upload from device ${deviceId} for user ${userId || 'unknown'}`);

        addLog({
            method: 'FaceID',
            user: userId || 'unknown',
            deviceId: deviceId || 'unknown',
            status: 'success',
            location: 'Lobby Camera'
        });

        let imageUrl = null;

        // If Firebase Storage is configured, upload the image
        if (bucket) {
            const fileName = `faces/${userId || 'unknown'}_${Date.now()}_${file.originalname}`;
            const fileUpload = bucket.file(fileName);
            
            await fileUpload.save(file.buffer, {
                metadata: { contentType: file.mimetype }
            });
            
            // Getting signed URL instead handles private buckets
            const [url] = await fileUpload.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            });
            imageUrl = url;
        }

        if (db) {
            await db.collection('accessLogs').add({
                method: 'FaceID',
                userId: userId || 'unknown',
                deviceId: deviceId || 'unknown',
                imageUrl: imageUrl || 'Storage disabled',
                timestamp: new Date()
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Face image uploaded and logged successfully',
            imageUrl 
        });
    } catch (error) {
        next(error);
    }
};

exports.handleFaceSimulation = async (req, res, next) => {
    try {
        const { userId, deviceId } = req.body;

        console.log(`Received simulated Face ID check from device ${deviceId} for user ${userId || 'unknown'}`);

        addLog({
            method: 'FaceID',
            user: userId || 'unknown',
            deviceId: deviceId || 'unknown',
            status: 'success',
            location: 'Dashboard Simulation'
        });

        if (db) {
            await db.collection('accessLogs').add({
                method: 'FaceID',
                userId: userId || 'unknown',
                deviceId: deviceId || 'unknown',
                imageUrl: 'simulation',
                timestamp: new Date(),
                status: 'success'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Face simulation logged successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.getAccessLogs = async (req, res, next) => {
    try {
        const limit = Math.max(1, Math.min(Number(req.query.limit) || 100, 500));

        if (!db) {
            return res.status(200).json({ success: true, logs: getLogs(limit) });
        }

        try {
            const snapshot = await db
                .collection('accessLogs')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            const logs = snapshot.docs.map(mapDbLog);
            return res.status(200).json({ success: true, logs });
        } catch (firebaseQueryError) {
            console.error('Failed to query Firestore logs, falling back to memory store:', firebaseQueryError.message);
            return res.status(200).json({ success: true, logs: getLogs(limit) });
        }
    } catch (error) {
        next(error);
    }
};
