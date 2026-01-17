import { auth } from "@/lib/auth";
import { apiResponse } from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        const { token } = await req.json();
        await auth.verifyEmail(token);

        return apiResponse(true, "Email verified successfully");
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
