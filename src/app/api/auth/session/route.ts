import { apiResponse } from "@/utils/apiResponse";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/errors/auth.error";
import { requireAuth } from "@/lib/auth/guards";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const { session } = await requireAuth();

        if (!session || session.expiresAt < new Date()) {
            const cookieStore = await cookies();
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