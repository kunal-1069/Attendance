const admin = require('firebase-admin');

// Ensure that we only initialize if we have the necessary credentials
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines from .env string
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || ''
        });
        console.log('Firebase Admin initialized successfully');
    } catch (err) {
        console.error('Firebase initialization error:', err.message);
    }
} else {
    console.warn('Firebase credentials not complete in .env file. Firebase is NOT initialized.');
}

const db = admin.apps.length ? admin.firestore() : null;
const auth = admin.apps.length ? admin.auth() : null;
const bucket = admin.apps.length && process.env.FIREBASE_STORAGE_BUCKET ? admin.storage().bucket() : null;

module.exports = { admin, db, auth, bucket };
