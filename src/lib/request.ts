import { headers } from "next/headers";

export async function getRequestMeta() {
    const h = await headers();
    return {
        ipAddress: h.get("x-forwarded-for") ?? undefined,
        userAgent: h.get("user-agent") ?? undefined,
    };
}