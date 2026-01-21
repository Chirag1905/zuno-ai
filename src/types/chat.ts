export interface ChatSession {
    id: string;
    title: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    isUser: boolean;
}

export type ApiMessageRole = "USER" | "ASSISTANT" | "SYSTEM";

export interface ApiMessage {
    id: string;
    content: string;
    role: ApiMessageRole;
}
