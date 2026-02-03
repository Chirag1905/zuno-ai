import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
    AuthResponse,
    LoginPayload,
    VerifyMfaPayload
} from "@/types/auth";

interface AdminRegisterPayload {
    name: string;
    email: string;
    password: string;
}

export const adminAuthService = {
    login: (payload: LoginPayload) =>
        api.post<AuthResponse>("/admin/auth/login", payload),

    register: (payload: AdminRegisterPayload) =>
        api.post<ApiResponse<unknown>>("/admin/auth/register", payload),

    getSession: () =>
        api.get<AuthResponse>("/admin/auth/session"),

    // Reuse user auth endpoints for these
    verifyMfa: (payload: VerifyMfaPayload) =>
        api.post<ApiResponse<unknown>>("/auth/mfa/verify", payload),

    resendMfa: (email: string) =>
        api.post<ApiResponse<unknown>>("/auth/mfa/resend", { email }),

    resendVerification: (email: string) =>
        api.post<ApiResponse<unknown>>("/auth/verification/resend-verification", { email }),

    logout: () =>
        api.post<ApiResponse<unknown>>("/auth/logout"),

    logoutAll: () =>
        api.post<ApiResponse<unknown>>("/auth/logout-all"),
};
