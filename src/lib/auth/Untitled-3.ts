
import prisma from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OAUTH_PROVIDERS } from "@/lib/auth/oauth";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    ctx: { params: Promise<{ provider: string }> }
) {
    const { provider } = await ctx.params;

    const config = OAUTH_PROVIDERS[provider as keyof typeof OAUTH_PROVIDERS];
    if (!config) {
        return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) throw new Error("Missing OAuth params");

    // STATE VALIDATION
    const cookieStore = await cookies();
    const storedState = cookieStore.get(`oauth_state_${provider}`)?.value;

    if (!storedState || storedState !== state) {
        throw new Error("Invalid OAuth state");
    }

    cookieStore.delete(`oauth_state_${provider}`);

    // TOKEN EXCHANGE
    const tokenRes = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        },
        body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: `${process.env.APP_URL}/api/auth/oauth/callback/${provider}`,
        }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
        console.error("OAuth token error:", tokenData);
        throw new Error("Token exchange failed");
    }

    // FETCH PROFILE
    const profileRes = await fetch(config.userInfoUrl, {
        headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
        },
    });

    const profile = await profileRes.json();

    const email = profile.email;
    if (!email) throw new Error("Email not provided by OAuth");

    const providerAccountId = profile.sub || profile.id;
    if (!providerAccountId) throw new Error("Provider account ID missing");

    // ACCOUNT LINKING LOGIC
    const existingAccount = await prisma.account.findUnique({
        where: {
            providerId_accountId: {
                providerId: provider,
                accountId: providerAccountId,
            },
        },
        include: { user: true },
    });

    let user;

    if (existingAccount) {
        // ✅ OAuth account already linked
        user = existingAccount.user;
    } else {
        // 🔍 Check user by email
        user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // 🆕 Create new user
            user = await prisma.user.create({
                data: {
                    email,
                    name: profile.name || profile.login || "Anonymous",
                    image: profile.picture || profile.avatar_url,
                    emailVerified: true,
                },
            });
        }

        // 🔗 Link OAuth account
        await prisma.account.create({
            data: {
                userId: user.id,
                providerId: provider,
                accountId: providerAccountId,
            },
        });
    }

    // CREATE SESSION
    const session = await createSession({ userId: user.id });

    cookieStore.set("session", session.token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        expires: session.expiresAt,
    });

    redirect("/dashboard");
}