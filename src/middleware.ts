import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './lib/auth'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    console.log(pathname, "logs")

    // Protect admin routes except login
    if (pathname.startsWith("/dashboard") && pathname !== "/") {
        const token = request.cookies.get("auth")?.value

        if (!token) {
            return NextResponse.redirect(new URL("/", request.url))
        }

        try {
            const verified = await verifyToken(token)
            if (!verified) {
                return NextResponse.redirect(new URL("/", request.url))
            }
        } catch (error) {
            return NextResponse.redirect(new URL("/", request.url))
        }
    }

    // Redirect authenticated users away from login
    if (pathname === "/") {
        const token = request.cookies.get("auth")?.value

        if (token) {
            try {
                const verified = await verifyToken(token)
                if (verified) {
                    return NextResponse.redirect(new URL("/dashboard", request.url))
                }
            } catch (error) {
                // Continue to login page
            }
        }
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/", "/dashboard/:path*"],
}