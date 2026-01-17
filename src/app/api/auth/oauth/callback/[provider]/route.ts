import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { OAUTH_PROVIDERS } from "@/lib/auth/oauth";
import { getRequestMeta } from "@/lib/request";
import { AuthError } from "@/lib/auth/errors";
import { isRedirectError } from "next/dist/client/components/redirect-error";

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

        /**
         * 🔐 MFA required
         */
        if (result.mfaRequired) {
            redirect(`/auth/mfa?provider=${provider}`);
        }

        /**
         * ✅ Session already created
         */
        redirect("/dashboard");

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