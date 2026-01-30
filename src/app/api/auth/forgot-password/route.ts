import { auth } from "@/lib/auth";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/errors/auth.error";
import { apiResponse } from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        await auth.forgotPassword(email);
        return apiResponse(
            true,
            "Password reset link sent successfully",
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
