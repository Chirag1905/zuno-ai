export type AuthErrorCode =
    | "EMAIL_EXISTS"
    | "INVALID_CREDENTIALS"
    | "EMAIL_NOT_VERIFIED"
    | "INVALID_OTP"
    | "OTP_LOCKED"
    | "INVALID_TOKEN"
    | "UNAUTHENTICATED"
    | "FORBIDDEN"

    // 🔽 SESSION / LOGOUT / ACTION ERRORS
    | "SESSION_NOT_FOUND"
    | "SESSION_EXPIRED"
    | "LOGOUT_FAILED"
    | "LOGOUT_ALL_FAILED"
    | "EMAIL_SEND_FAILED"
    | "ACTION_NOT_ALLOWED"

    | "INTERNAL";

export class AuthError extends Error {
    code: AuthErrorCode;
    status: number;

    constructor(code: AuthErrorCode, status = 400) {
        super(code);
        this.code = code;
        this.status = status;
    }
}

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
    EMAIL_EXISTS: "Email already exists",
    INVALID_CREDENTIALS: "Invalid email or password",
    EMAIL_NOT_VERIFIED: "Please verify your email",
    INVALID_OTP: "Invalid or expired OTP",
    OTP_LOCKED: "Too many attempts. Try again later",
    INVALID_TOKEN: "Invalid or expired token",
    UNAUTHENTICATED: "You are not logged in",
    FORBIDDEN: "Access denied",

    // 🔽 New
    SESSION_NOT_FOUND: "Session not found",
    SESSION_EXPIRED: "Your session has expired",
    LOGOUT_FAILED: "Unable to log out. Please try again",
    LOGOUT_ALL_FAILED: "Unable to log out from all devices",
    EMAIL_SEND_FAILED: "Unable to send email. Try again later",
    ACTION_NOT_ALLOWED: "This action is not allowed",

    INTERNAL: "Something went wrong. Please try again",
};