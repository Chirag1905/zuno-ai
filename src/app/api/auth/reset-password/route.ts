import { auth } from "@/lib/auth";
import { apiResponse } from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();
        await auth.resetPassword(token, password);

        return apiResponse(true, "Password reset successful");
    } catch {
        return apiResponse(
            false,
            "Invalid or expired token",
            null,
            null,
            400
        );
    }
}
