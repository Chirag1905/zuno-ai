import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
    AuthResponse,
    LoginPayload,
    RegisterPayload,
    ResetPasswordPayload,
    VerifyMfaPayload
} from "@/types/auth";

export const authService = {
    login: (payload: LoginPayload) =>
        api.post<AuthResponse>("/auth/login", payload),

    register: (payload: RegisterPayload) =>
        api.post<ApiResponse<any>>("/auth/register", payload),

    logout: () =>
        api.post<ApiResponse<any>>("/auth/logout"),

    logoutAll: () =>
        api.post<ApiResponse<any>>("/auth/logout-all"),

    forgotPassword: (email: string) =>
        api.post<ApiResponse<any>>("/auth/forgot-password", { email }),

    resetPassword: (payload: ResetPasswordPayload) =>
        api.post<ApiResponse<any>>("/auth/reset-password", payload),

    resendVerification: (email: string) =>
        api.post<ApiResponse<any>>("/auth/verification/resend-verification", { email }),

    verifyEmail: (token: string) =>
        api.post<ApiResponse<any>>("/auth/verification/send-verification", { token }),

    verifyMfa: (payload: VerifyMfaPayload) =>
        api.post<ApiResponse<any>>("/auth/mfa/verify", payload),

    resendMfa: (email: string) =>
        api.post<ApiResponse<any>>("/auth/mfa/resend", { email }),

    getSession: () =>
        api.get<AuthResponse>("/auth/session"),
};
