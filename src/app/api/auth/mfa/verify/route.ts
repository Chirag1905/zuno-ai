// import { auth } from "@/lib/auth";
// import { AuthError } from "@/lib/auth/errors";
// import { getRequestMeta } from "@/lib/request";
// import { apiResponse } from "@/utils/apiResponse";
// import { cookies } from "next/headers";

// export async function POST(req: Request) {
//     try {
//         const { email, otp, rememberDevice } = await req.json();
//         const meta = await getRequestMeta();

//         const { user, session } = await auth.verifyMfa({
//             email,
//             otp,
//             rememberDevice,
//             ...meta,
//         });

//         const cookieStore = await cookies();
//         cookieStore.set("session", session.token, {
//             httpOnly: true,
//             sameSite: "lax",
//             path: "/",
//             expires: session.expiresAt,
//         });

//         return apiResponse(true, "Logged in successfully", { user });

//     } catch (e) {
//         if (e instanceof AuthError) {
//             return apiResponse(
//                 false,
//                 e.message === "OTP_LOCKED"
//                     ? "Too many attempts. Try again later."
//                     : "Invalid or expired OTP",
//                 null,
//                 null,
//                 e.status
//             );
//         }

//         return apiResponse(false, "Something went wrong", null, null, 500);
//     }
// }

import { auth } from "@/lib/auth";
import { getRequestMeta } from "@/lib/request";
import { apiResponse } from "@/utils/apiResponse";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const { email, otp, rememberDevice } = await req.json();
        const meta = await getRequestMeta();

        const { user, session } = await auth.verifyMfa({
            email,
            otp,
            rememberDevice,
            ...meta,
        });

        const cookieStore = await cookies();

        cookieStore.set("session", session.token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            expires: session.expiresAt,
        });

        return apiResponse(true, "Logged in successfully", { user });
    } catch {
        return apiResponse(
            false,
            "Invalid or expired OTP",
            null,
            null,
            401
        );
    }
}
