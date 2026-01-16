import { auth } from "@/lib/auth";
import { apiResponse } from "@/app/utils/apiResponse";
import { z } from "zod";
import { formatZodError } from "@/app/utils/handleZodError";

/* =============================
    Validation Schema
============================= */
const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

/* =============================
    LOGIN
============================= */
export async function POST(req: Request) {
    try {
        // 1️⃣ Parse JSON safely
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return apiResponse(false, "Invalid JSON body", null, null, 400);
        }

        // 2️⃣ Validate input
        const parsed = LoginSchema.safeParse(body);
        if (!parsed.success) {
            return apiResponse(
                false,
                "Validation error",
                null,
                formatZodError(parsed.error),
                422
            );
        }

        const { email, password } = parsed.data;

        // 3️⃣ Attempt login
        const result = await auth.api.signInEmail({
            email,
            password,
            request: req,
        });
        console.log("🚀 ~ POST ~ result:", result)

        // 4️⃣ Invalid credentials
        if (!result?.user) {
            return apiResponse(
                false,
                "Invalid email or password",
                null,
                null,
                401
            );
        }

        const user = result.user;

        // 5️⃣ Email not verified
        if (!user.emailVerified) {
            return apiResponse(
                false,
                "Email not verified",
                {
                    email: user.email,
                },
                null,
                403,
                {
                    action: "VERIFY_EMAIL",
                }
            );
        }

        // 6️⃣ Account disabled / blocked (if you support it)
        if ("isActive" in user && user.isActive === false) {
            return apiResponse(
                false,
                "Account is disabled. Please contact support.",
                null,
                null,
                403
            );
        }

        // 7️⃣ Password not set (OAuth-only account)
        if (!user.hasPassword) {
            return apiResponse(
                false,
                "Password not set. Please set a password to continue.",
                null,
                null,
                409,
                {
                    action: "SET_PASSWORD",
                }
            );
        }

        // 8️⃣ Success
        return apiResponse(
            true,
            `Logged in successfully ${user.name ?? ""}`.trim(),
            {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            },
            null,
            200
        );
    } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error) {
            const code = (error as { code?: string }).code;

            if (code === "INVALID_CREDENTIALS") {
                return apiResponse(false, "Invalid email or password", null, null, 401);
            }

            if (code === "EMAIL_NOT_VERIFIED") {
                return apiResponse(false, "Email not verified", null, null, 403);
            }
        }

        console.error("LOGIN_ERROR:", error);

        return apiResponse(
            false,
            "Server Error",
            null,
            error instanceof Error ? error.message : String(error),
            500
        );
    }

}