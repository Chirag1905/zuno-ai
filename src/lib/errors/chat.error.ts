export type ChatErrorCode =
    | "CHAT_CREATE_FAILED"
    | "CHAT_UPDATE_FAILED"
    | "CHAT_DELETE_FAILED"
    | "CHAT_NOT_FOUND"
    | "CHAT_ACCESS_DENIED"
    | "INVALID_CHAT_ID"
    | "CHAT_INTERNAL";

export class ChatError extends Error {
    code: ChatErrorCode;
    status: number;

    constructor(code: ChatErrorCode, status = 400) {
        super(code);
        this.code = code;
        this.status = status;
    }
}

export const CHAT_ERROR_MESSAGES: Record<ChatErrorCode, string> = {
    CHAT_CREATE_FAILED: "Unable to create chat",
    CHAT_UPDATE_FAILED: "Unable to update chat",
    CHAT_DELETE_FAILED: "Unable to delete chat",
    CHAT_NOT_FOUND: "Chat not found",
    CHAT_ACCESS_DENIED: "You do not have access to this chat",
    INVALID_CHAT_ID: "Invalid chat ID",
    CHAT_INTERNAL: "Something went wrong while processing chat",
};
