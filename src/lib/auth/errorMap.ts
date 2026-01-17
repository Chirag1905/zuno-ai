import { AuthErrorCode } from "@/lib/auth/errors";

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
    EMAIL_EXISTS: "Email already exists",
    INVALID_CREDENTIALS: "Invalid email or password",
    EMAIL_NOT_VERIFIED: "Please verify your email",
    INVALID_OTP: "Invalid or expired OTP",
    OTP_LOCKED: "Too many attempts. Try again later",
    INVALID_TOKEN: "Invalid or expired token",
    UNAUTHENTICATED: "Unauthenticated",
    FORBIDDEN: "Access denied",
    INTERNAL: "Something went wrong. Please try again",
};
