import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { apiResponse } from "@/utils/apiResponse";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/auth/errors";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;

        if (!token) {
            return apiResponse(false, "Unauthenticated", null, null, 401);
        }

        const session = await auth.getSession(token);

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