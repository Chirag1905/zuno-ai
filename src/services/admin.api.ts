import api from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/api";

export const adminService = {
    getUsers: (params: Record<string, any>) =>
        api.get<PaginatedResponse<any>>("/admin/users", { params }),

    getUserById: (id: string) =>
        api.get<ApiResponse<any>>(`/admin/users/${id}`),

    createUser: (payload: any) =>
        api.post<ApiResponse<any>>("/admin/users", payload),

    updateUser: (id: string, payload: any) =>
        api.put<ApiResponse<any>>(`/admin/users/${id}`, payload),

    deleteUser: (id: string) =>
        api.delete<ApiResponse<any>>(`/admin/users/${id}`),
};
