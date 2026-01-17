import { TRUSTED_DEVICE_EXPIRY } from "@/lib/auth/constants";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function createTrustedDevice(
    userId: string,
) {
    const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
    const raw = crypto.randomBytes(32).toString("hex");

    await prisma.trustedDevice.create({
        data: {
            userId,
            hash: sha256(raw),
            expiresAt: new Date(Date.now() + TRUSTED_DEVICE_EXPIRY),
        },
    });

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";

    cookieStore.set("trusted_device", raw, {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        path: "/",
        maxAge: TRUSTED_DEVICE_EXPIRY / 1000,
    });
}