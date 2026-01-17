import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { apiResponse } from "@/utils/apiResponse";

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (token) {
        await auth.logout(token);
        cookieStore.delete("session");
    }

    return apiResponse(true, "Logged out successfully");
}
