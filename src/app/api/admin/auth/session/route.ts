import { auth } from "@/lib/auth";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/errors/auth.error";
import { apiResponse } from "@/types/apiResponse";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("session")?.value;

        if (!token) {
            return apiResponse(
                false,
                AUTH_ERROR_MESSAGES.UNAUTHENTICATED,
                null,
                { code: "UNAUTHENTICATED" },
                401
            );
        }

        const session = await auth.getSession(token);

        // Verify user has admin role
        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return apiResponse(
                false,
                "Access denied. Admin privileges required.",
                null,
                { code: "FORBIDDEN" },
                403
            );
        }

        return apiResponse(
            true,
            "Session retrieved successfully",
            { user: session.user, session },
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
