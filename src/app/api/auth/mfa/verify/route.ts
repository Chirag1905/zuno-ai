import { auth } from "@/lib/auth";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/errors/auth.error";
import { getRequestMeta } from "@/lib/request";
import { apiResponse } from "@/types/apiResponse";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { email, otp, rememberDevice } = await req.json();
        const meta = await getRequestMeta();

        const { user, session } = await auth.verifyMfa({
            email,
            otp,
            rememberDevice,
            ...meta,
        });

        const cookieStore = await cookies();

        cookieStore.set("session", session.token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            expires: session.expiresAt,
        });

        return apiResponse(
            true,
            "Logged in successfully",
            user,
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