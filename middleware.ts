import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

enum UserType {
    REGULAR = 'REGULAR',
    MEMBER = 'MEMBER',
    TRUSTIE = 'TRUSTIE',
    UPPER_TRUSTIE = 'UPPER_TRUSTIE',
}

const USER_HIERARCHY: Record<UserType, number> = {
    [UserType.REGULAR]: 1,
    [UserType.MEMBER]: 2,
    [UserType.TRUSTIE]: 3,
    [UserType.UPPER_TRUSTIE]: 4,
};

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Define auth pages where logged-in users should NOT access
    const authPages = ['/auth/signin', '/auth/signup', '/'];

    // Get access token from cookies
    const accessToken = req.cookies.get('accessToken')?.value;

    // If user is logged in and tries to access auth pages, redirect to home or dashboard
    if (accessToken && authPages.includes(pathname)) {
        // You can customize this to redirect anywhere you want logged-in users to land
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Allow public routes
    if (
        pathname === '/' ||
        pathname.startsWith('/(public)') ||
        pathname === '/unauthorized' ||
        pathname.startsWith('/api/')
    ) {
        return NextResponse.next();
    }

    // If no access token, redirect to login (except for public and auth pages already handled)
    if (!accessToken) {
        const loginUrl = new URL('/auth/signin', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Verify token and get user_type
    let userType: UserType | undefined;
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verifyUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) throw new Error('Failed to verify user');

        const data = await response.json();

        if (Object.values(UserType).includes(data.user_type)) {
            userType = data.user_type as UserType;
        } else {
            throw new Error('Invalid user type');
        }
    } catch (error) {
        console.error('Error verifying user:', error);
        return NextResponse.redirect(new URL('/auth/signin', req.url));
    }

    if (!userType) {
        return NextResponse.redirect(new URL('/suth/signin', req.url));
    }

    // Check role permissions on protected routes
    const requiredRoleMatch = pathname.match(/\/\(protected\)\/([^/]+)/)?.[1]?.toUpperCase();
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
        '/auth/signin',
        '/auth/signup',
        '/'
    ],
};
