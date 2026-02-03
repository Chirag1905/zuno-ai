import { auth } from "@/lib/auth";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/errors/auth.error";
import { getRequestMeta } from "@/lib/request";
import { apiResponse } from "@/types/apiResponse";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();
        const meta = await getRequestMeta();

        await auth.registerAdmin({ name, email, password, ...meta });

        return apiResponse(
            true,
            "Admin account created successfully. Please verify your email.",
            null,
            null,
            201
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
