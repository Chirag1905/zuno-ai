import { auth } from "@/lib/auth";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/errors/auth.error";
import { getRequestMeta } from "@/lib/request";
import { apiResponse } from "@/types/apiResponse";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        const meta = await getRequestMeta();

        const result = await auth.login({
            email,
            password,
            ...meta,
        });

        /* =========================
        SUCCESS LOGIN (NO MFA)
        ========================= */
        if (!result.isTrusted) {
            if (!result.session) {
                return apiResponse(
                    false,
                    AUTH_ERROR_MESSAGES.INTERNAL,
                    null,
                    { code: "INTERNAL" },
                    500
                );
            }

            const cookieStore = await cookies();
            cookieStore.set("session", result.session.token, {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                expires: result.session.expiresAt,
            });

            return apiResponse(
                true,
                "Logged in successfully",
                result,
                null,
                200
            );
        }

        // MFA required
        return apiResponse(
            true,
            "OTP sent to your email",
            result,
            null,
            200
        );
    } catch (e) {
        if (e instanceof AuthError) {
            return apiResponse(
                false,
                AUTH_ERROR_MESSAGES[e.code],
                null,
                { code: e.code },
                e.status
            );
        }

        return apiResponse(
            false,
            AUTH_ERROR_MESSAGES.INTERNAL,
            null,
            { code: "INTERNAL" },
            500
        );
    }
}
