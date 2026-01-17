export type AuthErrorCode =
    | "EMAIL_EXISTS"
    | "INVALID_CREDENTIALS"
    | "EMAIL_NOT_VERIFIED"
    | "INVALID_OTP"
    | "OTP_LOCKED"
    | "INVALID_TOKEN"
    | "UNAUTHENTICATED"
    | "FORBIDDEN"
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
