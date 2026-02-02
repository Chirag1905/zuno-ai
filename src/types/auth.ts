import { ApiResponse } from "@/types/api";
import { userType as User } from "@/types/userType";

export interface LoginPayload {
    email?: string;
    password?: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    country?: string;
}

export interface ResetPasswordPayload {
    token: string | null;
    password: string;
}

export interface VerifyMfaPayload {
    email: string | null;
    otp: string;
    rememberDevice: boolean;
    deviceName: string;
}

export interface AuthResponseData {
    isTrusted?: boolean;
    user?: User;
}

export type AuthResponse = ApiResponse<AuthResponseData>;
