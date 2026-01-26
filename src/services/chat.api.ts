import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { ApiMessage, ChatSession } from "@/types/chat";

export const chatService = {
    getChats: () =>
        api.get<ApiResponse<ChatSession[]>>("/c"),

    createChat: () =>
        api.post<ApiResponse<ChatSession>>("/c"),

    getChatMessages: (chatId: string) =>
        api.get<ApiResponse<{ messages: ApiMessage[] }>>(`/c/${chatId}`),

    updateChatTitle: (chatId: string, title: string) =>
        api.patch<ApiResponse<ChatSession>>(`/c/${chatId}`, { title }),

    deleteChat: (chatId: string) =>
        api.delete<ApiResponse<null>>(`/c/${chatId}`),
};
