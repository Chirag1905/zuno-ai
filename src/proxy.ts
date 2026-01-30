import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Auth pages
    const authRoutes = [
        "/signin",
        "/signup",
        "/forgotpassword",
        "/resetpassword",
        "/verify-otp",
        "/send-verification"
    ];

    // Public routes (no auth needed)
    const publicRoutes = [
        "/signin",
        "/signup",
        "/forgotpassword",
        "/resetpassword",
        "/verify-otp",
        "/send-verification",
        "/api/auth",
    ];

    // 🔐 Get session token
    const token = req.cookies.get("session")?.value;

    /**
     * ✅ If user is already logged in
     * ❌ block signin/signup pages
     */
    if (token && authRoutes.some((p) => pathname.startsWith(p))) {
        const session = await prisma.session.findUnique({
            where: { token },
            include: {
                user: { select: { role: true } },
            },
        });

        if (session?.user?.role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin", req.url));
        }

        return NextResponse.redirect(new URL("/", req.url));
    }

    // 🔓 Allow public routes if not logged in
    if (publicRoutes.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // ❌ Not logged in → redirect to signin
    if (!token) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    // 🔎 Fetch session + role
    const session = await prisma.session.findUnique({
        where: { token },
        include: {
            user: { select: { role: true } },
        },
    });

    if (!session) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    const role = session.user.role;

    // 👤 USER → chat only
    if (pathname.startsWith("/") && role !== "USER") {
        return NextResponse.redirect(new URL("/admin", req.url));
    }

    // 🛠 ADMIN → admin only
    if (pathname.startsWith("/admin") && role === "USER") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


// import { NextRequest, NextResponse } from "next/server";

// export async function proxy(request: NextRequest) {
//     const path = request.nextUrl.pathname;
//     const token = request.cookies.get("session")?.value || "";

//     // 1️⃣ Auth Routes (Accessible only when NOT logged in)
//     const authRoutes = [
//         "/signin",
//         "/signup",
//         "/forgotpassword",
//         "/resetpassword",
//         "/verify-otp",
//     ];

//     // 2️⃣ Public APIs (Always accessible)
//     const publicApiPrefixes = ["/api/auth", "/api/webhooks"];

//     const isAuthRoute = authRoutes.some((route) => path.startsWith(route));
//     const isPublicApi = publicApiPrefixes.some((prefix) => path.startsWith(prefix));

//     // ✅ LOGGED IN LOGIC
//     if (token) {
//         // If user is logged in and tries to access auth pages (signin, signup...)
//         if (isAuthRoute) {
//             return NextResponse.redirect(new URL("/", request.nextUrl));
//         }
//         // Allow access to protected routes
//         return NextResponse.next();
//     }

//     // ❌ NOT LOGGED IN LOGIC
//     if (!token) {
//         // Allow access to auth pages and public APIs
//         if (isAuthRoute || isPublicApi) {
//             return NextResponse.next();
//         }

//         // Redirect all other protected routes to signin
//         return NextResponse.redirect(new URL("/signin", request.nextUrl));
//     }

//     return NextResponse.next();
// }


// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";

// export async function proxy(req: NextRequest) {
//     const { pathname } = req.nextUrl;

//     // Auth pages
//     const authRoutes = ["/signin", "/signup"];

//     // 🔓 Public routes
//     const publicRoutes = [
//         "/signin",
//         "/signup",
//         "/forgotpassword",
//         "/resetpassword",
//         "/verify-otp",
//         "/api/auth",
//     ];

//     if (publicRoutes.some((p) => pathname.startsWith(p))) {
//         return NextResponse.next();
//     }

//     // 🔐 Get session token
//     const token = req.cookies.get("session")?.value;

//     if (!token) {
//         return NextResponse.redirect(new URL("/signin", req.url));
//     }

//     // 🔎 Fetch session + user role
//     const session = await prisma.session.findUnique({
//         where: { token },
//         include: {
//             user: {
//                 select: { role: true },
//             },
//         },
//     });

//     if (!session) {
//         return NextResponse.redirect(new URL("/signin", req.url));
//     }

//     const role = session.user.role;

//     // 👤 USER → chat only
//     if (pathname.startsWith("/c") && role !== "USER") {
//         return NextResponse.redirect(new URL("/admin", req.url));
//     }

//     // 🛠 ADMIN → admin only
//     if (pathname.startsWith("/admin") && role === "USER") {
//         return NextResponse.redirect(new URL("/c", req.url));
//     }

//     return NextResponse.next();
// }

// export const config = {
//     matcher: [
//         "/((?!_next/static|_next/image|favicon.ico).*)",
//     ],
// };
