import { NextRequest, NextResponse } from "next/server";
import { getCookieOptions } from "@/lib/auth/cookie";

// Note: Prisma in middleware is generally not supported in Edge Runtime. 
// If you encounter errors, you may need to move database logic to a dedicated API route or use an edge-compatible adapter.
// For now, we are keeping the logic as requested but be aware of this limitation.
import prisma from "@/lib/prisma";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const hostname = req.headers.get("host") || "";

    // 🌐 Subdomain Detection
    // Allow localhost handling (e.g. admin.localhost:3000)
    const isLocalhost = hostname.includes("localhost");
    const subdomain = isLocalhost ? hostname.split(".")[0] : hostname.split(".")[0];
    // In localhost:3000, split(".")[0] is "localhost". In admin.localhost:3000, it is "admin".
    // In admin.zunoai.com, it is "admin".

    const isAdminSubdomain = subdomain === "admin";

    // -------------------------------------------------------------------------
    // 1️⃣ Route Definitions
    // -------------------------------------------------------------------------

    // Auth routes (shared)
    const authRoutes = [
        "/signin",
        "/signup",
        "/forgotpassword",
        "/resetpassword",
        "/verify-otp",
        "/verify-email"
    ];

    // Public API prefix
    const publicApiPrefixes = [
        "/api/auth",
        "/api/admin/auth", // Admin auth APIs might still be needed in some cases
        "/api/webhooks",
        "/_next",
        "/favicon.ico",
        "/public",
        "/assets" // if any
    ];

    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    const isPublicApi = publicApiPrefixes.some((prefix) => pathname.startsWith(prefix));

    // 🔐 Check for session cookie
    const token = req.cookies.get("session")?.value;

    // -------------------------------------------------------------------------
    // 2️⃣ ADMIN SUBDOMAIN LOGIC (admin.zunoai.com)
    // -------------------------------------------------------------------------

    if (isAdminSubdomain) {
        // Prevent loops on internal paths if any
        if (pathname.startsWith("/admin")) {
            // If the user somehow navigates to /admin explicitly on the subdomain, 
            // we might want to strip it or just handle it. 
            // But usually, we rewrite TO /admin.
        }

        // ✅ Case A: Has session
        if (token) {
            try {
                // WARN: Prisma in edge runtime
                const session = await prisma.session.findUnique({
                    where: { token },
                    select: {
                        id: true,
                        user: { select: { role: true } }
                    }
                });

                if (!session) {
                    // Invalid session
                    const response = NextResponse.redirect(new URL("/signin", req.url));
                    response.cookies.delete("session");
                    return response;
                }

                const userRole = session.user.role;
                const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

                // If not admin, deny access -> Redirect to user dashboard
                if (!isAdmin) {
                    const response = NextResponse.redirect(new URL(`${req.nextUrl.protocol}//${hostname.replace("admin.", "")}`, req.url));
                    return response;
                }

                // If admin trying to access auth pages, redirect to dashboard (which is root / on admin subdomain)
                if (isAuthRoute) {
                    return NextResponse.redirect(new URL("/", req.url));
                }

                // 🚀 REWRITE to /admin folder
                // This makes admin.zunoai.com/ show contents of src/app/admin/
                return NextResponse.rewrite(new URL(`/admin${pathname === "/" ? "" : pathname}`, req.url));

            } catch (error) {
                console.error("Middleware Session error:", error);
                // If DB fails, safe fallback to signin
                return NextResponse.redirect(new URL("/signin", req.url));
            }
        }

        // ❌ Case B: No session
        if (!token) {
            // Allow access to auth pages and public APIs 
            // (These live in src/app/(auth) which are mapped to root /signin, etc. normally)
            // We do NOT rewrite these to /admin. We serve them as is.
            if (isAuthRoute || isPublicApi) {
                return NextResponse.next();
            }

            // Redirect to signin for any other page
            return NextResponse.redirect(new URL("/signin", req.url));
        }
    }

    // -------------------------------------------------------------------------
    // 3️⃣ MAIN DOMAIN LOGIC (zunoai.com)
    // -------------------------------------------------------------------------

    // Rewrite is not needed for main domain (maps to src/app/(user) at root by default)
    // But we should block access to /admin path if accessed directly

    if (pathname.startsWith("/admin")) {
        // Redirect /admin on main domain to admin.zunoai.com? 
        // Or just redirect to root
        return NextResponse.redirect(new URL("https://admin.zunoai.com", req.url)); // Or dynamic based on host
    }

    if (token) {
        // Optional: Check if user is valid? 
        // For performance, we might skip DB check here and let app layout handle it,
        // BUT existing code did checking. We'll keep it simple if possible.
        // Existing 'proxy.ts' did DB check. We will keep it.
        try {
            const session = await prisma.session.findUnique({
                where: { token },
                select: { user: { select: { role: true } } }
            });

            if (!session) {
                const response = NextResponse.redirect(new URL("/signin", req.url));
                response.cookies.delete("session");
                return response;
            }

            if (isAuthRoute) {
                return NextResponse.redirect(new URL("/", req.url));
            }
        } catch (e) {
            // ignore
        }
    } else {
        // No token
        // Protect private routes?
        // Existing code: "if (isUserAuthRoute ... return next)"
        // If it's a private route and no token -> Redirect to signin
        const isPrivate = !isAuthRoute && !isPublicApi;
        if (isPrivate) {
            return NextResponse.redirect(new URL("/signin", req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};
