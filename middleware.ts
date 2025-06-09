import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define user type enum for type safety
enum UserType {
    MEMBER = 'MEMBER',
    TRUSTIE = 'TRUSTIE',
    UPPER_TRUSTIE = 'UPPER_TRUSTIE',
}

// Define user type hierarchy with enum keys
const USER_HIERARCHY: Record<UserType, number> = {
    [UserType.MEMBER]: 1,
    [UserType.TRUSTIE]: 2,
    [UserType.UPPER_TRUSTIE]: 3,
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public routes
    if (
        pathname === '/' ||
        pathname.startsWith('/(public)') ||
        pathname === '/login' ||
        pathname.startsWith('/api/') ||
        pathname === '/unauthorized'
    ) {
        return NextResponse.next();
    }

    // Check for access token
    const accessToken = req.cookies.get('accessToken')?.value;

    if (!accessToken) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Verify token and fetch user_type via API route
    let userType: UserType | undefined;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verifyUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to verify user');
        }

        const data = await response.json();
        // Ensure user_type is a valid UserType
        if (Object.values(UserType).includes(data.user_type)) {
            userType = data.user_type as UserType;
        } else {
            throw new Error('Invalid user type');
        }
    } catch (error) {
        console.error('Error verifying user:', error);
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (!userType) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Check access permissions based on route and user_type
    const requiredRoleMatch = pathname.match(/\/\(protected\)\/([^/]+)/)?.[1]?.toUpperCase();
    // Convert requiredRole to match UserType enum (e.g., 'member' -> 'MEMBER')
    const requiredRole = requiredRoleMatch as UserType | undefined;

    if (requiredRole && USER_HIERARCHY[requiredRole]) {
        const userLevel = USER_HIERARCHY[userType];
        const requiredLevel = USER_HIERARCHY[requiredRole];

        if (userLevel < requiredLevel) {
            return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
    }

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