import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // -------------------------------------------------------------------------
    // 1️⃣ Route Definitions
    // -------------------------------------------------------------------------

    // Auth routes (Accessible only when NOT logged in)
    const authRoutes = [
        "/signin",
        "/signup",
        "/forgotpassword",
        "/resetpassword",
        "/verify-otp",
        "/verify-email"
    ];

    // Public API routes (Always accessible)
    const publicApiPrefixes = [
        "/api/auth",
        "/api/webhooks",
        "/_next",
        "/favicon.ico",
        "/public"
    ];

    // Admin routes (Protected + Role check needed in Layout)
    const adminRoutePrefix = "/admin";

    // -------------------------------------------------------------------------
    // 2️⃣ Helper Checks
    // -------------------------------------------------------------------------

    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    const isPublicApi = publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));

    // 🔐 Check for session cookie
    const token = req.cookies.get("session")?.value;

    // -------------------------------------------------------------------------
    // 3️⃣ Logic Flow
    // -------------------------------------------------------------------------

    // ✅ Case A: User has session cookie
    if (token) {
        // Validate session exists in database
        try {
            const session = await prisma.session.findUnique({
                where: { token },
                select: { id: true }
            });

            // If session doesn't exist in DB, clear the cookie and redirect to signin
            if (!session) {
                const response = NextResponse.redirect(new URL("/signin", req.url));
                response.cookies.delete("session");
                response.cookies.delete("trusted_device");
                return response;
            }
        } catch (error) {
            // If DB check fails, clear cookie and redirect to signin
            console.error("Session validation error:", error);
            const response = NextResponse.redirect(new URL("/signin", req.url));
            response.cookies.delete("session");
            response.cookies.delete("trusted_device");
            return response;
        }

        // Session is valid - if trying to access Auth pages, redirect to dashboard
        if (isAuthRoute) {
            return NextResponse.redirect(new URL("/", req.url));
        }

        // Allow access to all other pages
        return NextResponse.next();
    }

    // ❌ Case B: User is NOT Logged In
    if (!token) {
        // 1. Allow access to Auth pages and Public APIs
        if (isAuthRoute || isPublicApi) {
            return NextResponse.next();
        }

        // 2. Redirect all other private routes (Dashboard, Admin) to Signin
        const signInUrl = new URL("/signin", req.url);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

// -----------------------------------------------------------------------------
// ⚙️ Config
// -----------------------------------------------------------------------------
export const config = {
    // Matcher excluding static files and images
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
