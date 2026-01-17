import { auth } from "@/lib/auth";
import { getRequestMeta } from "@/lib/request";
import { apiResponse } from "@/utils/apiResponse";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        const meta = await getRequestMeta();

        const result = await auth.login({
            email,
            password,
            ...meta,
        });

        if (result.mfaRequired === false && result.session) {
            const cookieStore = await cookies();

            cookieStore.set("session", result.session.token, {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                expires: result.session.expiresAt,
            });

            return apiResponse(true, "Logged in successfully", {
                user: result.user,
            });
        }

        return apiResponse(true, "OTP sent to your email", {
            mfaRequired: true,
        });
    } catch {
        return apiResponse(
            false,
            "Invalid email or password",
            null,
            null,
            401
        );
    }
}
