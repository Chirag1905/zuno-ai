import { sendMfaOtp } from "@/lib/auth/verification";
import { apiResponse } from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (email) await sendMfaOtp(email);
    } catch {
        // silent (avoid enumeration)
    }

    return apiResponse(true, "OTP resent to your email");
}
