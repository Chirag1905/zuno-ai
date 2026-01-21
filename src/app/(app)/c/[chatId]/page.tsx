"use client";

import { useCallback, useEffect } from "react";
import { useParams } from "next/navigation";

import {
    useChatStore,
    useLLMStore,
    useModelStore,
    useStreamStore,
} from "@/store";
import ChatLayout from "@/components/Layouts/ChatLayout";

export default function ChatPage() {

    const params = useParams<{ chatId: string }>();
    const chatId = params.chatId;

    const {
        input,
        activeChatId,
        setInput,
        addMessage,
        ensureChatSession,
        switchChat,
    } = useChatStore();

    const { model } = useModelStore();
    const { online } = useLLMStore();
    const { send, stop, generating } = useStreamStore();

    /* -------------------- Sync URL → Store -------------------- */
    useEffect(() => {
        if (!chatId) return;
        switchChat(chatId);
    }, [chatId, switchChat]);

    /* -------------------- Stop on Chat Switch -------------------- */
    useEffect(() => {
        stop();
    }, [activeChatId, stop]);

    /* -------------------- ESC to Stop -------------------- */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && generating) stop();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [generating, stop]);

    const generateChatTitle = (text: string) => {
        return text
            .replace(/\n/g, " ")
            .slice(0, 40)
            .trim();
    };

    /* -------------------- Send Message -------------------- */
    const sendMessage = useCallback(async () => {
        if (!input.trim() || generating) return;

        const sessionId = await ensureChatSession();
        const userText = input.trim();

        const messages =
            useChatStore.getState().messagesByChat[sessionId] ?? [];

        const isFirstMessage = messages.length === 0;

        addMessage(sessionId, { text: userText, isUser: true });
        setInput("");

        if (isFirstMessage) {
            const title = generateChatTitle(userText);
            useChatStore.getState().updateChatTitle(sessionId, title);
        }

        if (!online) {
            addMessage(sessionId, {
                text: "⚠️ Local LLM is offline.\n\nStart Ollama to continue.",
                isUser: false,
            });
            return;
        }

        await send({
            chatId: sessionId,
            model,
            text: userText,
        });
    }, [
        input,
        generating,
        ensureChatSession,
        addMessage,
        setInput,
        send,
        model,
        online,
    ]);

    return (
        <ChatLayout
            sendMessage={sendMessage}
            stopResponse={stop}
        />
    );
}
