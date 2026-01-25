"use client";

import { useCallback } from "react";
import {
    useChatStore,
    useLLMStore,
    useModelStore,
    useStreamStore,
} from "@/store";

export function useRegenerateMessage() {
    const activeChatId = useChatStore((s) => s.activeChatId);
    const messagesByChat = useChatStore((s) => s.messagesByChat);
    const removeLastAssistantMessage = useChatStore(
        (s) => s.removeLastAssistantMessage
    );

    const { model } = useModelStore();
    const { online } = useLLMStore();
    const { send, generating, stop } = useStreamStore();

    return useCallback(async () => {
        if (!activeChatId || generating) return;

        const messages = messagesByChat[activeChatId];
        if (!messages || messages.length < 2) return;

        // 🔹 Find last user message
        const lastUser = [...messages].reverse().find((m) => m.isUser);
        if (!lastUser) return;

        // 🔹 Stop current stream
        stop();

        // 🔹 Remove previous assistant response
        removeLastAssistantMessage(activeChatId);

        if (!online) return;

        // 🔹 Restart stream with same prompt
        await send({
            chatId: activeChatId,
            model,
            text: lastUser.text,
            mode: "regenerate",
        });
    }, [
        activeChatId,
        messagesByChat,
        generating,
        stop,
        removeLastAssistantMessage,
        send,
        model,
        online,
    ]);
}