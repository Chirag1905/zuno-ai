import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { ApiMessage, ChatSession } from "@/types/chat";

export const chatService = {
    list: () =>
        api.get<ApiResponse<ChatSession[]>>("/c"),

    create: () =>
        api.post<ApiResponse<ChatSession>>("/c"),

    messages: (chatId: string) =>
        api.get<ApiResponse<{ messages: ApiMessage[] }>>(`/c/${chatId}`),

    updateTitle: (chatId: string, title: string) =>
        api.patch<ApiResponse<ChatSession>>(`/c/${chatId}`, { title }),

    delete: (chatId: string) =>
        api.delete<ApiResponse<null>>(`/c/${chatId}`),
};
