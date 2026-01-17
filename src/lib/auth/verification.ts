import { sendEmail } from "@/lib/mail";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function sendEmailVerification(email: string) {
    const token = crypto.randomBytes(32).toString("hex");

    await prisma.verification.create({
        data: {
            id: crypto.randomUUID(),
            identifier: email,
            value: token,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
    });

    const link = `${process.env.APP_URL}/verify-email?token=${token}`;

    await sendEmail({
        to: email,
        subject: "Verify your email",
        html: `
          <p>Click the link below to verify your email:</p>
          <a href="${link}">${link}</a>
        `,
    });
}

export async function sendMfaOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.verification.create({
        data: {
            id: crypto.randomUUID(),
            identifier: email,
            value: otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
    });

    await sendEmail({
        to: email,
        subject: "Login OTP",
        text: `Your OTP: ${otp}`,
    });
}