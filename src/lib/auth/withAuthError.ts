import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/auth/errors";
import { apiResponse } from "@/utils/apiResponse";

type Handler = () => Promise<Response>;

export function withAuthError(handler: Handler) {
    return async (): Promise<Response> => {
        try {
            return await handler();
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

            console.error("Unhandled API error:", e);

            return apiResponse(
                false,
                AUTH_ERROR_MESSAGES.INTERNAL,
                null,
                { code: "INTERNAL" },
                500
            );
        }
    };
}