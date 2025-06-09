import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';
import { NextResponse } from 'next/server';

// Define user type enum for consistency
enum UserType {
    MEMBER = 'MEMBER',
    TRUSTIE = 'TRUSTIE',
    UPPER_TRUSTIE = 'UPPER_TRUSTIE',
}

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

        if (!accessToken) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        // Verify Firebase token
        const decodedToken = await adminAuth.verifyIdToken(accessToken);
        const userId = decodedToken.uid;

        // Fetch user data from Firestore
        const userDoc = await adminDb.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData = userDoc.data();
        const userType = userData?.user_type;

        // Validate user_type against UserType enum
        if (!Object.values(UserType).includes(userType)) {
            return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
        }

        return NextResponse.json({ user_type: userType });
    } catch (error) {
        console.error('Error verifying user:', error);
        return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 });
    }
}