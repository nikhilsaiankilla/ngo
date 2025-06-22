import { adminAuth, adminDb } from '@/firebase/firebaseAdmin'; // Import Firebase admin authentication and Firestore instance
import { NextResponse } from 'next/server'; // Import Next.js response utility

// Define user type enum for consistency
enum UserType {
    MEMBER = 'MEMBER',
    TRUSTIE = 'TRUSTIE',
    UPPER_TRUSTIE = 'UPPER_TRUSTIE',
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization'); // Get Authorization header from the request
        const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null; // Extract token from "Bearer <token>" format

        if (!accessToken) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 }); // Return error if token is missing
        }

        // Verify Firebase token
        const decodedToken = await adminAuth.verifyIdToken(accessToken); // Decode and verify the Firebase token
        const userId = decodedToken.uid; // Extract user ID from the decoded token

        // Fetch user data from Firestore
        const userDoc = await adminDb.collection('users').doc(userId).get(); // Get user document from Firestore

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 }); // Return error if user document doesn't exist
        }

        const userData = userDoc.data(); // Extract user data from document
        const userType = userData?.user_type; // Get user_type from user data

        // Validate user_type against UserType enum
        if (!Object.values(UserType).includes(userType)) {
            return NextResponse.json({ error: 'Invalid user type' }, { status: 400 }); // Return error if user_type is not valid
        }

        return NextResponse.json({ user_type: userType }); // Return user_type if everything is valid
    } catch (error) {
        console.error('Error verifying user:', error); // Log the error for debugging
        return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 }); // Return generic error response
    }
}
