"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

import {
    useChatStore,
    useLLMStore,
    useModelStore,
    useStreamStore,
} from "@/store";
import { useSendMessage } from "@/hooks/useSendMessage";
import ChatLayout from "@/components/user/Layouts/ChatLayout";

export default function ChatPage() {

    const { chatId } = useParams<{ chatId: string }>();
    const switchChat = useChatStore((s) => s.switchChat)
    const generating = useStreamStore((s) => s.generating);
    const stop = useStreamStore((s) => s.stop);
    const sendMessage = useSendMessage();

    /* -------------------- Sync URL → Store -------------------- */
    useEffect(() => {
        if (!chatId) return;
        switchChat(chatId);
    }, [chatId, switchChat]);

    /* -------------------- ESC to Stop -------------------- */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && generating) stop();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [generating, stop]);

    return (
        <ChatLayout
            sendMessage={sendMessage}
            stopResponse={stop}
        />
    );
}
