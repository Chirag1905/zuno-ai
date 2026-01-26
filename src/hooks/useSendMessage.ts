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

        const userPrompt = input.trim();

        // 🔹 Ensure chat exists (draft → real)
        const chatId =
            activeChatId ?? (await ensureChatSession());

        const existingMessages =
            useChatStore.getState().messagesByChat[chatId] ?? [];

        addMessage(chatId, { text: userPrompt, isUser: true });
        setInput("");

        // 🔹 First message → title
        if (existingMessages.length === 0) {
            const title = generateChatTitle(userPrompt);
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
            text: userPrompt,
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