import { auth } from "@/lib/auth";
import { apiResponse } from "@/types/apiResponse";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/errors/auth.error";
import { requireAuth } from "@/lib/auth/guards";
import { cookies } from "next/headers";
import { getCookieDeleteOptions } from "@/lib/auth/cookie";

export async function POST() {
    try {
        // Try to get session to delete from DB
        let token: string | undefined;
        try {
            const { session } = await requireAuth();
            token = session?.token;
        } catch {
            // Ignore auth error, proceed to clear cookie
        }

        if (token) {
            await auth.logout(token);
        } else {
            // Fallback: just clear cookie if no session found
            const cookieStore = await cookies();
            cookieStore.delete({ name: "session", ...getCookieDeleteOptions() });
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
            // If logout logic itself failed (e.g. DB error), still try to ensure cookie is gone
            const cookieStore = await cookies();
            cookieStore.delete({ name: "session", ...getCookieDeleteOptions() });

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