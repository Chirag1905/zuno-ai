export type AuthErrorCode =
    | "EMAIL_EXISTS"
    | "EMAIL_NOT_VERIFIED"
    | "EMAIL_SEND_FAILED"
    | "EMAIL_NOT_FOUND"
    | "INVALID_CREDENTIALS"
    | "INVALID_OTP"
    | "INVALID_TOKEN"
    | "OTP_LOCKED"
    | "UNAUTHENTICATED"
    | "FORBIDDEN"
    | "SESSION_NOT_FOUND"
    | "SESSION_EXPIRED"
    | "LOGOUT_FAILED"
    | "LOGOUT_ALL_FAILED"
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
    EMAIL_NOT_VERIFIED: "Please verify your email",
    EMAIL_SEND_FAILED: "Unable to send email. Try again later",
    EMAIL_NOT_FOUND: "Email not found",
    INVALID_CREDENTIALS: "Invalid email or password",
    INVALID_OTP: "Invalid or expired OTP",
    INVALID_TOKEN: "Invalid or expired token",
    OTP_LOCKED: "Too many attempts. Try again later",
    UNAUTHENTICATED: "You are not logged in",
    FORBIDDEN: "Access denied",
    SESSION_NOT_FOUND: "Session not found",
    SESSION_EXPIRED: "Your session has expired",
    LOGOUT_FAILED: "Unable to log out. Please try again",
    LOGOUT_ALL_FAILED: "Unable to log out from all devices",
    ACTION_NOT_ALLOWED: "This action is not allowed",

    INTERNAL: "Something went wrong. Please try again",
};