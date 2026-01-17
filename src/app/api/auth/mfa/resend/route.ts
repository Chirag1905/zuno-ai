import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/auth/errors";
import { sendMfaOtp } from "@/lib/auth/verification";
import { apiResponse } from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (email) await sendMfaOtp(email);
        return apiResponse(
            true,
            "OTP resent to your email",
            null,
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