import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Check if it's the admin subdomain
    // Matches admin.zunoai.com or admin.localhost (for dev)
    const isAdminSubdomain = hostname.startsWith('admin.');

    // Shared routes that should pass through on both subdomains
    // (auth) folder routes map to root URLs
    const sharedRoutes = [
        '/signin',
        '/signup',
        '/verify-otp',
        '/forgotpassword',
        '/verify-email',
        '/resetpassword',
        '/_next', // Next.js assets
        '/api',   // API routes
        '/static',
        '/public',
        '/favicon.svg'
    ];

    /* 
     * Helper to check if path starts with shared route
     */
    const isSharedRoute = sharedRoutes.some(route => url.pathname.startsWith(route));

    // --- Admin Subdomain Logic ---
    if (isAdminSubdomain) {

        // Redirect root to dashboard
        if (url.pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Pass through shared auth/api routes
        if (isSharedRoute) {
            return NextResponse.next();
        }

        // 🔐 Check Session for Admin Routes
        // If user is not logged in, redirect to signin
        const token = request.cookies.get("session")?.value;
        if (!token) {
            return NextResponse.redirect(new URL('/signin', request.url));
        }

        // Rewrite admin-friendly URLs to actual /admin file structure
        // e.g. /dashboard -> /admin/dashboard
        // e.g. /users -> /admin/users
        // Avoid double-rewriting if path already starts with /admin (though ideally requests shouldn't)
        if (!url.pathname.startsWith('/admin')) {
            return NextResponse.rewrite(new URL(`/admin${url.pathname}`, request.url));
        }
    }

    // --- User/Public Subdomain Logic (zunoai.com) ---
    else {
        // Prevent access to /admin routes from main domain
        if (url.pathname.startsWith('/admin')) {
            // Redirect to root or 404
            return NextResponse.redirect(new URL('/', request.url));
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
