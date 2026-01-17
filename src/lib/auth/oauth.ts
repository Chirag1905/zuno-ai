export type OAuthProvider = "google" | "github";

export const OAUTH_PROVIDERS = {
    google: {
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
        scope: "openid email profile",
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },

    github: {
        authUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",
        userInfoUrl: "https://api.github.com/user",
        scope: "user:email",
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
} satisfies Record<OAuthProvider, unknown>;

// export const providers = {
//     google: {
//         auth: "https://accounts.google.com/o/oauth2/v2/auth",
//         token: "https://oauth2.googleapis.com/token",
//         userinfo: "https://www.googleapis.com/oauth2/v2/userinfo",
//     },
//     github: {
//         auth: "https://github.com/login/oauth/authorize",
//         token: "https://github.com/login/oauth/access_token",
//         userinfo: "https://api.github.com/user",
//     },
// };