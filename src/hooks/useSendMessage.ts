"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    useChatStore,
    useLLMStore,
    useModelStore,
    useStreamStore,
} from "@/store";

const generateChatTitle = (text: string) =>
    text.replace(/\n/g, " ").slice(0, 40).trim();

export function useSendMessage() {
    const router = useRouter();

    const {
        input,
        activeChatId,
        setInput,
        addMessage,
        ensureChatSession,
    } = useChatStore();

    const { model } = useModelStore();
    const { online } = useLLMStore();
    const { send, generating } = useStreamStore();

    return useCallback(async () => {
        if (!input.trim() || generating) return;

        const userText = input.trim();

        // 🔹 Ensure chat exists (draft → real)
        const chatId =
            activeChatId ?? (await ensureChatSession());

        const messages =
            useChatStore.getState().messagesByChat[chatId] ?? [];

        addMessage(chatId, { text: userText, isUser: true });
        setInput("");

        // 🔹 First message → title
        if (messages.length === 0) {
            const title = generateChatTitle(userText);
            useChatStore.getState().updateChatTitle(chatId, title);
        }

        // 🔹 Redirect only once (from / → /c/id)
        if (!activeChatId) {
            router.push(`/c/${chatId}`);
        }

        if (!online) {
            addMessage(chatId, {
                text: "⚠️ Local LLM is offline.\n\nStart Ollama to continue.",
                isUser: false,
            });
            return;
        }

        await send({
            chatId,
            model,
            text: userText,
            mode: "new",
        });
    }, [
        input,
        generating,
        activeChatId,
        ensureChatSession,
        addMessage,
        setInput,
        send,
        model,
        online,
        router,
    ]);
}