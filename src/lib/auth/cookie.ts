import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export function getCookieOptions(expires?: Date): Partial<ResponseCookie> {
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const isProduction = appUrl.includes("https://");

    // Extract domain from APP_URL for cookie scope
    // e.g. https://zunoai.com -> .zunoai.com
    // e.g. http://localhost:3000 -> localhost
    let domain: string | undefined = undefined;

    try {
        const url = new URL(appUrl);
        domain = url.hostname;
        // If it's not localhost, prepend dot for subdomain sharing
        if (domain === 'localhost') {
            domain = undefined;
        } else {
            domain = '.' + domain;
        }
    } catch (e) {
        console.error("Failed to parse APP_URL for cookie domain", e);
    }

    return {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        domain,
        expires,
    };
}

export function getCookieDeleteOptions() {
    const options = getCookieOptions();
    return {
        path: options.path,
        domain: options.domain,
    };
}
