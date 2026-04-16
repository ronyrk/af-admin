import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'e94b50c81b572c6cf3133605764980b87dade9ecbf2600b98dd15dc74bab5dffe4756a334621fb524b579787c03f53d88d57391ac847bd9166ccde7e32a9848a';
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/admin'];

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const token = request.cookies.get('auth')?.value;

    // Check if route is public
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    // Check if route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    // If it's a protected route and no token exists, redirect to login
    if (isProtectedRoute && !token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If token exists, verify it
    if (token) {
        try {
            await jwtVerify(token, SECRET_KEY);
        } catch (error) {
            // Token is invalid, clear it and redirect to login if on protected route
            const response = NextResponse.next();
            response.cookies.delete('auth_token');

            if (isProtectedRoute) {
                const loginUrl = new URL('/login', request.url);
                loginUrl.searchParams.set('redirect', pathname);
                return NextResponse.redirect(loginUrl);
            }

            return response;
        }
    }

    // If user is logged in and tries to access public auth routes, redirect to dashboard
    if (isPublicRoute && token) {
        try {
            await jwtVerify(token, SECRET_KEY);
            // Valid token, redirect to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } catch (error) {
            // Invalid token, allow access to public routes
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
