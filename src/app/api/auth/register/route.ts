import { auth } from "@/lib/auth";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/auth/errors";
import { getRequestMeta } from "@/lib/request";
import { apiResponse } from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        const { email, password, name, country } = await req.json();
        const meta = await getRequestMeta();

        await auth.register({
            name,
            email,
            password,
            country,
            ...meta, // safe even if unused
        });

        return apiResponse(
            true,
            "Registered successfully. Please verify your email.",
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