import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function requireAuth() {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) throw new Error("UNAUTHORIZED");

    const session = await auth.getSession(token);
    if (!session) throw new Error("UNAUTHORIZED");

    return session.user;
}