import { apiResponse } from "@/utils/apiResponse";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/auth/errors";
import { requireAuth } from "@/lib/auth/guards";

export async function GET() {
    try {
        const { session } = await requireAuth();

        if (!session || session.expiresAt < new Date()) {
            cookieStore.delete("session");
            return apiResponse(false, "Session expired", null, null, 401);
        }

        return apiResponse(
            true,
            "Session fetched",
            session,
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