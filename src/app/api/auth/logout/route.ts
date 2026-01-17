import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { apiResponse } from "@/utils/apiResponse";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/auth/errors";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;

        if (token) {
            await auth.logout(token);
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