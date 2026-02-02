import { auth } from "@/lib/auth";
import { apiResponse } from "@/types/apiResponse";
import { requireAuth } from "@/lib/auth/guards";

export async function POST() {
    try {
        const { session } = await requireAuth();

        if (session) {
            await auth.logoutAll(session.user.id);
        }

        cookieStore.delete("session");

        return apiResponse(true, "Logged out from all devices");
    } catch (error) {
        console.error("Logout all devices error:", error);

        return apiResponse(
            false,
            "Failed to logout from all devices",
            null,
            error instanceof Error ? error.message : null,
            500
        );
    }
}
