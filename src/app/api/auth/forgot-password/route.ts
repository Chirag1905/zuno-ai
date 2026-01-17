import { auth } from "@/lib/auth";
import { apiResponse } from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        await auth.requestPasswordReset(email);
    } catch {
        // silent
    }

    return apiResponse(true, "If the email exists, a reset link was sent");
}
