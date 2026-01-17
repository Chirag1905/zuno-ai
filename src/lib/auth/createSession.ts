import { SESSION_EXPIRY } from "@/lib/auth/constants";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function createSession({
    userId,
    ipAddress,
    userAgent,
}: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
}) {

    return prisma.session.create({
        data: {
            id: crypto.randomUUID(),
            token: crypto.randomBytes(32).toString("hex"),
            userId,
            ipAddress,
            userAgent,
            expiresAt: new Date(Date.now() + SESSION_EXPIRY),
        },
    });
}