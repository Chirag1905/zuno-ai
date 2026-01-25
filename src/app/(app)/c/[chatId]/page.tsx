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
    // useEffect(() => {
    //     stop();
    // }, [activeChatId, stop]);

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
        if (!input.trim() || generating || !activeChatId) return;

        const userText = input.trim();

        const messages =
            useChatStore.getState().messagesByChat[activeChatId] ?? [];

        addMessage(activeChatId, { text: userText, isUser: true });
        setInput("");

        if (messages.length === 0) {
            const title = generateChatTitle(userText);
            useChatStore.getState().updateChatTitle(activeChatId, title);
        }

        if (!online) {
            addMessage(activeChatId, {
                text: "⚠️ Local LLM is offline.\n\nStart Ollama to continue.",
                isUser: false,
            });
            return;
        }

        await send({
            chatId: activeChatId,
            model,
            text: userText,
        });
    }, [
        input,
        generating,
        activeChatId,
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
