import crypto from "crypto";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/createSession";
import { sendMfaOtp, sendEmailVerification } from "@/lib/auth/verification";
import { AuthError } from "@/lib/auth/errors";
import { sendEmail } from "@/lib/mail";
import { OAUTH_PROVIDERS } from "@/lib/auth/oauth";
import { OTP_LOCK_MS, OTP_MAX_ATTEMPTS, RESET_TOKEN_EXPIRY } from "@/lib/auth/constants";
import { createTrustedDevice } from "@/lib/auth/createTrustedDevice";

// HELPERS
const sha256 = (v: string) =>
    crypto.createHash("sha256").update(v).digest("hex");

async function tryTrustedSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string
) {
    const cookieStore = await cookies();
    const raw = cookieStore.get("trusted_device")?.value;
    if (!raw) return null;

    const device = await prisma.trustedDevice.findFirst({
        where: {
            userId,
            hash: sha256(raw),
            expiresAt: { gt: new Date() },
        },
    });

    if (!device) return null;

    return createSession({
        userId,
        ipAddress,
        userAgent,
    });
}

/* ============================
   AUTH SERVICE (BUSINESS LOGIC)
============================ */
export const auth = {
    // REGISTER
    async register({ email, password, name }: {
        email: string;
        password: string;
        name?: string;
    }) {
        try {
            const exists = await prisma.user.findUnique({ where: { email } });
            if (exists) throw new AuthError("EMAIL_EXISTS", 409);

            const user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: await hashPassword(password),
                },
            });

            try {
                await sendEmailVerification(user.email);
            } catch {
                throw new AuthError("EMAIL_SEND_FAILED", 500);
            }
            return { userId: user.id };
        } catch (e) {
            if (e instanceof AuthError) throw e;
            throw new AuthError("INTERNAL", 500);
        }
    },

    // LOGIN
    async login({ email, password, ipAddress, userAgent }: {
        email: string;
        password: string;
        ipAddress?: string;
        userAgent?: string;
    }) {
        try {
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user || !user.password)
                throw new AuthError("INVALID_CREDENTIALS", 401);

            if (!(await verifyPassword(user.password, password)))
                throw new AuthError("INVALID_CREDENTIALS", 401);

            if (!user.emailVerified)
                throw new AuthError("EMAIL_NOT_VERIFIED", 403);

            /* =========================
            NO MFA → DIRECT LOGIN
            ========================= */
            if (!user.mfaEnabled) {
                const session = await createSession({
                    userId: user.id,
                    ipAddress,
                    userAgent,
                });

                return {
                    isTrusted: false,
                    session,
                };
            }

            /* =========================
            MFA ENABLED → CHECK TRUSTED DEVICE
            ========================= */
            const trustedSession = await tryTrustedSession(
                user.id,
                ipAddress,
                userAgent
            );

            if (trustedSession) {
                return {
                    isTrusted: false,
                    session: trustedSession,
                };
            }


            /* =========================
            MFA REQUIRED → SEND OTP
            ========================= */
            try {
                await sendMfaOtp(user.email);
            } catch {
                throw new AuthError("EMAIL_SEND_FAILED", 500);
            }
            return {
                isTrusted: true,
                userId: user.id,
                email: user.email,
            };
        } catch (e) {
            if (e instanceof AuthError) throw e;
            throw new AuthError("INTERNAL", 500);
        }
    },

    // VERIFY MFA
    async verifyMfa({
        email,
        otp,
        rememberDevice,
        ipAddress,
        userAgent,
    }: {
        email: string;
        otp: string;
        rememberDevice?: boolean;
        ipAddress?: string;
        userAgent?: string;
    }) {
        const ip = ipAddress ?? "unknown";
        try {
            const attempt = await prisma.otpAttempt.findUnique({
                where: { email_ip: { email, ip } },
            });

            if (
                attempt?.lockedAt &&
                Date.now() - attempt.lockedAt.getTime() < OTP_LOCK_MS
            ) {
                throw new AuthError("OTP_LOCKED", 429);
            }

            const record = await prisma.verification.findFirst({
                where: {
                    identifier: email,
                    value: otp,
                    expiresAt: { gt: new Date() },
                },
            });

            if (!record) {
                const updated = await prisma.otpAttempt.upsert({
                    where: { email_ip: { email, ip } },
                    update: { attempts: { increment: 1 } },
                    create: { email, ip, attempts: 1 },
                });

                if (updated.attempts >= OTP_MAX_ATTEMPTS) {
                    await prisma.otpAttempt.update({
                        where: { email_ip: { email, ip } },
                        data: { lockedAt: new Date() },
                    });
                    throw new AuthError("OTP_LOCKED", 429);
                }

                throw new AuthError("INVALID_OTP", 401);
            }


            // ✅ OTP valid → cleanup
            await prisma.verification.delete({ where: { id: record.id } });
            await prisma.otpAttempt.deleteMany({ where: { email, ip } });

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) throw new AuthError("UNAUTHENTICATED", 401);

            const session = await createSession({
                userId: user.id,
                ipAddress,
                userAgent,
            });

            if (rememberDevice) {
                await createTrustedDevice(user.id);
            }

            return { user, session };
        } catch (e) {
            if (e instanceof AuthError) throw e;
            throw new AuthError("INTERNAL", 500);
        }
    },

    // PASSWORD RESET (REQUEST)
    async requestPasswordReset(email: string) {
        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return;

            const token = crypto.randomBytes(20).toString("hex");

            await prisma.verification.create({
                data: {
                    identifier: email,
                    value: token,
                    expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY),
                },
            });

            try {
                await sendEmail(email, "Reset Password", `Token: ${token}`);
            } catch {
                throw new AuthError("EMAIL_SEND_FAILED", 500);
            }
        } catch (e) {
            if (e instanceof AuthError) throw e;
            throw new AuthError("INTERNAL", 500);
        }
    },

    // PASSWORD RESET
    async resetPassword(token: string, password: string) {
        try {
            const record = await prisma.verification.findFirst({
                where: { value: token, expiresAt: { gt: new Date() } },
            });

            if (!record) throw new AuthError("INVALID_TOKEN", 400);

            await prisma.user.update({
                where: { email: record.identifier },
                data: { password: await hashPassword(password) },
            });

            await prisma.verification.delete({ where: { id: record.id } });
        } catch (e) {
            if (e instanceof AuthError) throw e;
            console.error("reset password error:", e);
            throw new AuthError("INTERNAL", 500);
        }
    },

    // VERIFY EMAIL
    async verifyEmail(token: string) {
        try {
            const record = await prisma.verification.findFirst({
                where: { value: token, expiresAt: { gt: new Date() } },
            });

            if (!record) throw new AuthError("INVALID_TOKEN", 400);

            await prisma.user.update({
                where: { email: record.identifier },
                data: {
                    emailVerified: true,
                    emailVerifiedAt: new Date(),
                },
            });

            await prisma.verification.delete({ where: { id: record.id } });
        } catch (e) {
            if (e instanceof AuthError) throw e;
            console.error("verify email error:", e);
            throw new AuthError("INTERNAL", 500);
        }
    },

    // OAUTH LOGIN / REGISTER
    async oauthLogin({
        provider,
        providerAccountId,
        email,
        name,
        image,
        ipAddress,
        userAgent,
    }: {
        provider: keyof typeof OAUTH_PROVIDERS;
        providerAccountId: string;
        email: string;
        name?: string;
        image?: string;
        ipAddress?: string;
        userAgent?: string;
    }) {
        try {
            const account = await prisma.account.findUnique({
                where: {
                    providerId_accountId: {
                        providerId: provider,
                        accountId: providerAccountId,
                    },
                },
                include: { user: true },
            });

            let user = account?.user;

            // First OAuth login
            if (!user) {
                user = await prisma.user.upsert({
                    where: { email },
                    update: {
                        name,
                        image,
                        emailVerified: true,
                        emailVerifiedAt: new Date(),
                    },
                    create: {
                        email,
                        name,
                        image,
                        emailVerified: true,
                        emailVerifiedAt: new Date(),
                    },
                });

                await prisma.account.create({
                    data: {
                        userId: user.id,
                        providerId: provider,
                        accountId: providerAccountId,
                    },
                });
            }


            // MFA check
            if (user?.mfaEnabled) {
                try {
                    await sendMfaOtp(user.email);
                } catch {
                    throw new AuthError("EMAIL_SEND_FAILED", 500);
                }
                return { isTrusted: true };
            }

            // No MFA → session
            const session = await createSession({ userId: user.id, ipAddress, userAgent });
            return { user, session, isTrusted: false };

        } catch (e) {
            if (e instanceof AuthError) throw e;
            console.error("oauthLogin error:", e);
            throw new AuthError("INTERNAL", 500);
        }
    },

    // OAUTH CALLBACK
    async oauthCallback({
        provider,
        code,
        state,
        ipAddress,
        userAgent,
    }: {
        provider: keyof typeof OAUTH_PROVIDERS;
        code: string;
        state: string;
        ipAddress?: string;
        userAgent?: string;
    }) {
        try {
            const config = OAUTH_PROVIDERS[provider];
            if (!config) throw new AuthError("INVALID_TOKEN", 400);

            const cookieStore = await cookies();
            const stored = cookieStore.get(`oauth_state_${provider}`)?.value;

            if (!stored || stored !== state) {
                throw new AuthError("INVALID_TOKEN", 400);
            }

            cookieStore.delete(`oauth_state_${provider}`);

            /* =========================
               TOKEN EXCHANGE
            ========================= */
            const tokenRes = await fetch(config.tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                },
                body: new URLSearchParams({
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    code,
                    grant_type: "authorization_code",
                    redirect_uri: `${process.env.APP_URL}/api/auth/oauth/callback/${provider}`,
                }),
            });

            const tokenText = await tokenRes.text();

            if (!tokenRes.ok) {
                console.error("❌ Google token error:", tokenText);
                throw new AuthError("INTERNAL", 500);
            }

            const token = JSON.parse(tokenText);

            if (!token.access_token) {
                console.error("❌ No access_token:", token);
                throw new AuthError("INTERNAL", 500);
            }

            /* =========================
               PROFILE FETCH
            ========================= */
            const profileRes = await fetch(config.userInfoUrl, {
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                    Accept: "application/json",
                },
            });

            const profileText = await profileRes.text();

            if (!profileRes.ok) {
                console.error("❌ Google profile error:", profileText);
                throw new AuthError("INTERNAL", 500);
            }

            const profile = JSON.parse(profileText);

            const id = profile.sub || profile.id;
            if (!id || !profile.email) {
                console.error("❌ Invalid Google profile:", profile);
                throw new AuthError("INTERNAL", 500);
            }

            /* =========================
               DELEGATE TO AUTH LOGIC
            ========================= */
            return await this.oauthLogin({
                provider,
                providerAccountId: id,
                email: profile.email,
                name: profile.name,
                image: profile.picture,
                ipAddress,
                userAgent,
            });
        } catch (e) {
            if (e instanceof AuthError) throw e;

            console.error("OAuth callback error:", e);
            throw new AuthError("INTERNAL", 500);
        }
    },

    // SESSION FETCH
    async getSession(token: string) {
        try {
            if (!token) {
                throw new AuthError("UNAUTHENTICATED", 401);
            }
            const session = await prisma.session.findUnique({
                where: { token },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                            emailVerified: true,
                            mfaEnabled: true,
                        },
                    },
                },
            });
            if (!session) {
                throw new AuthError("SESSION_NOT_FOUND", 404);
            }

            return session;
        } catch (e) {
            if (e instanceof AuthError) throw e;

            console.error("getSession error:", e);
            throw new AuthError("INTERNAL", 500);
        }
    },

    // LOGOUT
    async logout(token: string) {
        try {
            if (!token) {
                throw new AuthError("UNAUTHENTICATED", 401);
            }

            const cookieStore = await cookies();

            cookieStore.delete("session");

            const result = await prisma.session.deleteMany({
                where: { token },
            });

            // Optional strict mode
            if (result.count === 0) {
                throw new AuthError("SESSION_NOT_FOUND", 404);
            }

            return true;
        } catch (e) {
            if (e instanceof AuthError) throw e;

            console.error("Logout error:", e);
            throw new AuthError("LOGOUT_FAILED", 500);
        }
    },

    // LOGOUT-ALL
    async logoutAll(userId: string) {
        try {
            if (!userId) {
                throw new AuthError("UNAUTHENTICATED", 401);
            }

            const cookieStore = await cookies();
            cookieStore.delete("session");
            cookieStore.delete("trusted_device");

            const result = await prisma.session.deleteMany({
                where: { userId },
            });

            if (result.count === 0) {
                throw new AuthError("SESSION_NOT_FOUND", 404);
            }

            return true;
        } catch (e) {
            if (e instanceof AuthError) throw e;

            console.error("Logout all error:", e);
            throw new AuthError("LOGOUT_ALL_FAILED", 500);
        }
    }
};