import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { AuthError } from "@/lib/auth/errors";

export async function requireAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
        throw new AuthError("UNAUTHENTICATED", 401);
    }

    const session = await auth.getSession(token);

    if (!session) {
        throw new AuthError("SESSION_NOT_FOUND", 401);
    }

    return {
        user: session.user,
        session,
    };
}