import { auth } from "@/lib/auth";
import { apiResponse } from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        await auth.register(body);
        return apiResponse(true, "Registered successfully. Please verify your email.", null, null, 201);
    } catch (e) {
        if (e instanceof Error && e.message === "EMAIL_EXISTS") {
            return apiResponse(false, "Email already exists", null, null, 409);
        }
        return apiResponse(false, "Registration failed", null, null, 500);
    }
}
