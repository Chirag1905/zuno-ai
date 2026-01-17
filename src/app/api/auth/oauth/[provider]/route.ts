import { OAUTH_PROVIDERS } from "@/lib/auth/oauth";
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
    _: Request,
    ctx: { params: Promise<{ provider: string }> }
) {
    const { provider } = await ctx.params;

    const config = OAUTH_PROVIDERS[provider as keyof typeof OAUTH_PROVIDERS];
    if (!config) {
        return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const state = crypto.randomBytes(16).toString("hex");

    const cookieStore = await cookies();
    cookieStore.set(`oauth_state_${provider}`, state, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 600,
    });

    const url = new URL(config.authUrl);
    url.searchParams.set("client_id", config.clientId);
    url.searchParams.set(
        "redirect_uri",
        `${process.env.APP_URL}/api/auth/oauth/callback/${provider}`
    );
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", config.scope);
    url.searchParams.set("state", state);

    return NextResponse.redirect(url.toString());
}