import { auth } from "@/lib/auth";
import { apiResponse } from "@/utils/apiResponse";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/auth/errors";
import { requireAuth } from "@/lib/auth/guards";

export async function POST() {
    try {
        const { session } = await requireAuth();
        if (session) {
            await auth.logout(session.token);
        }

        return apiResponse(
            true,
            "Logged out successfully",
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