import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { apiResponse } from "@/utils/apiResponse";

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
        return apiResponse(true, "Already logged out");
    }

    const session = await auth.getSession(token);
    if (session) {
        await auth.logoutAll(session.user.id);
    }

    cookieStore.delete("session");
    return apiResponse(true, "Logged out from all devices");
}
