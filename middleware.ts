import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Allow public and login routes
    if (
        pathname === '/' ||
        pathname.startsWith('/(public)') ||
        pathname === '/login' ||
        pathname.startsWith('/api/')
    ) {
        return NextResponse.next();
    }

    // Check for presence of token cookie
    const token = req.cookies.get('token')?.value;
    if (!token) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Allow all other requests through — deeper checks in backend or pages
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
