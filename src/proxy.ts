import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 🔓 Public routes
    const publicRoutes = [
        "/signin",
        "/signup",
        "/forgotpassword",
        "/resetpassword",
        "/verify-otp",
        "/api/auth",
    ];

    if (publicRoutes.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // 🔐 Get session token
    const token = req.cookies.get("session")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    // 🔎 Fetch session + user role
    const session = await prisma.session.findUnique({
        where: { token },
        include: {
            user: {
                select: { role: true },
            },
        },
    });

    if (!session) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    const role = session.user.role;

    // 👤 USER → chat only
    if (pathname.startsWith("/c") && role !== "USER") {
        return NextResponse.redirect(new URL("/admin", req.url));
    }

    // 🛠 ADMIN → admin only
    if (pathname.startsWith("/admin") && role === "USER") {
        return NextResponse.redirect(new URL("/c", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
