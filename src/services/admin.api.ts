import api from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export const adminService = {
    getUsers: (params: Record<string, string | number | boolean>) =>
        api.get<PaginatedResponse<unknown>>("/admin/users", { params }),

    getUserById: (id: string) =>
        api.get<ApiResponse<unknown>>(`/admin/users/${id}`),

    createUser: (payload: Record<string, unknown>) =>
        api.post<ApiResponse<unknown>>("/admin/users", payload),

    updateUser: (id: string, payload: Record<string, unknown>) =>
        api.put<ApiResponse<unknown>>(`/admin/users/${id}`, payload),

    deleteUser: (id: string) =>
        api.delete<ApiResponse<unknown>>(`/admin/users/${id}`),
};
