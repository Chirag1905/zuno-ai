import api from "@/lib/axios";
import { ApiResponse, PaginatedResponse } from "@/types/api";
import { userType } from "@/types/userType";

export const adminService = {
    getUsers: (params: Record<string, string | number | boolean>) =>
        api.get<PaginatedResponse<userType>>("/admin/users", { params }),

    getUserById: (id: string) =>
        api.get<ApiResponse<userType>>(`/admin/users/${id}`),

    createUser: (payload: Partial<userType>) =>
        api.post<ApiResponse<userType>>("/admin/users", payload),

    updateUser: (id: string, payload: Partial<userType>) =>
        api.put<ApiResponse<userType>>(`/admin/users/${id}`, payload),

    deleteUser: (id: string) =>
        api.delete<ApiResponse<userType>>(`/admin/users/${id}`),
};
