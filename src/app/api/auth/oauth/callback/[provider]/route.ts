import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { OAUTH_PROVIDERS } from "@/lib/auth/oauth";
import { getRequestMeta } from "@/lib/request";
import { AuthError } from "@/lib/auth/errors";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";

export async function GET(
    req: Request,
    ctx: { params: Promise<{ provider: string }> }
) {
    const { provider } = await ctx.params;

    if (!OAUTH_PROVIDERS[provider as keyof typeof OAUTH_PROVIDERS]) {
        return NextResponse.json(
            { error: "Invalid provider" },
            { status: 400 }
        );
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
        return NextResponse.json(
            { error: "INVALID_TOKEN" },
            { status: 400 }
        );
    }

    try {
        const meta = await getRequestMeta();

        const result = await auth.oauthCallback({
            provider: provider as keyof typeof OAUTH_PROVIDERS,
            code,
            state,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
        });

        if (!result) {
            return NextResponse.json(
                { error: "INVALID_TOKEN" },
                { status: 400 }
            );
        }

        // 🔐 MFA required
        if (result.isTrusted && result.email) {
            redirect(
                `/verify-otp?email=${encodeURIComponent(
                    result.email
                )}&provider=${provider}`
            );
        }

        // ✅ NO MFA → SET SESSION COOKIE HERE
        if (result.session) {
            const cookieStore = await cookies();

            cookieStore.set("session", result.session.token, {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                expires: result.session.expiresAt,
            });
        }
        // ✅ Session already created
        redirect("/");

    } catch (e) {
        if (isRedirectError(e)) {
            throw e;
        }
        if (e instanceof AuthError) {
            return NextResponse.json(
                { error: e.code },
                { status: e.status }
            );
        }

        console.error("OAuth callback error:", e);
        return NextResponse.json(
            { error: "INTERNAL" },
            { status: 500 }
        );
    }
}