import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from './firebase/firebaseAdmin';
import { hasRole, UserRole } from './utils/helpers';

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow all public routes without auth
    if (
        pathname === '/' ||
        pathname.startsWith('/(public)') ||
        pathname === '/login' ||
        pathname.startsWith('/api/') // optionally let API handle separately
    ) {
        return NextResponse.next();
    }

    // Check for token cookie (Firebase ID token)
    const token = req.cookies.get('token')?.value;
    if (!token) {
        // No token → redirect to login
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Verify token
    let decodedToken;
    try {
        decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
        // Invalid token → redirect to login
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const uid = decodedToken.uid;
    const userDoc = await adminDb.collection('users').doc(uid).get();

    if (!userDoc.exists) {
        // User doc not found → redirect to login
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    const userData = userDoc.data();
    const userRole: UserRole = userData?.user_type || 'REGULAR';

    // Role-based access control for protected nested routes
    if (pathname.startsWith('/(protected)/(member)')) {
        if (!hasRole(userRole, 'MEMBER')) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    if (pathname.startsWith('/(protected)/(trustie)')) {
        if (!hasRole(userRole, 'TRUSTIE')) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    if (pathname.startsWith('/(protected)/(upper-trustie)')) {
        // Exact match for UPPER_TRUSTIE only
        if (userRole !== 'UPPER_TRUSTIE') {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // Authenticated & authorized
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/(protected)/:path*',
        '/(protected)/(member)/:path*',
        '/(protected)/(trustie)/:path*',
        '/(protected)/(upper-trustie)/:path*',
    ],
};
