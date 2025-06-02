// lib/firebaseAdmin.ts

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Ensure required Firebase Admin environment variables are set
if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
) {
    throw new Error("Missing Firebase Admin credentials in environment variables.");
}

// Construct service account credentials from env variables
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Firebase private key includes escaped newlines (\\n); convert them to real newlines
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
};

// Initialize Firebase Admin SDK only once
if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
    });
}

// Export initialized Admin services
const adminDb = getFirestore(); // Firestore instance with elevated (admin) privileges
const adminAuth = getAuth();    // Auth instance for verifying and managing users

export { adminDb, adminAuth };
