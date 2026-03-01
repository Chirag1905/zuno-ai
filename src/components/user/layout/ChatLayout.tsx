"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChatStore, useStreamStore } from "@/store";
import { ChatMessage } from "@/types/chat";
import ChatComposer from "@/components/user/chatArea/ChatComposer";
import ChatMessageList from "@/components/user/chatArea/ChatMessageList";
import { SidebarBrand } from "@/components/ui/SidebarBrand";
import Button from "@/components/ui/Button";

type ChatLayoutProps = {
    sendMessage: () => void;
    stopResponse: () => void;
};

const EMPTY_MESSAGES: readonly ChatMessage[] = Object.freeze([]);

export default function ChatLayout({
    sendMessage,
    stopResponse,
}: ChatLayoutProps) {
    const activeChatId = useChatStore((s) => s.activeChatId);
    const messagesByChat = useChatStore((s) => s.messagesByChat);
    const typing = useStreamStore((s) => s.typing);

    const messages = useMemo<readonly ChatMessage[]>(() => {
        if (!activeChatId) return EMPTY_MESSAGES;
        return messagesByChat[activeChatId] ?? EMPTY_MESSAGES;
    }, [activeChatId, messagesByChat]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);

    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const atBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < 120;

        setIsAtBottom(atBottom);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        if (isAtBottom) scrollToBottom();
    }, [messages, typing, isAtBottom, scrollToBottom]);

    /* ---------------- EMPTY STATE ---------------- */

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center safe-top safe-bottom">
                <SidebarBrand />
                <p className="mt-4 mb-8 text-gray-200 font-semibold text-lg">
                    How can I help you?
                </p>
                <ChatComposer
                    sendMessage={sendMessage}
                    stopResponse={stopResponse}
                />
            </div>
        );
    }

    /* ---------------- CHAT UI ---------------- */

    return (
        <div className="relative flex-1 flex flex-col h-dvh pt-20 safe-bottom">

            {/* MESSAGE AREA */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto chat-scroll px-2 sm:px-4"
            >
                <ChatMessageList
                    messages={messages}
                    typing={typing}
                    bottomRef={bottomRef}
                />
            </div>

            {/* SCROLL BUTTON */}
            {!isAtBottom && (
                <div className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-40">
                    <Button
                        icon="ArrowDown"
                        size="lg"
                        variant="default"
                        className="rounded-full shadow-lg backdrop-blur-md"
                        onClick={scrollToBottom}
                    />
                </div>
            )}

            {/* COMPOSER */}
            <ChatComposer
                sendMessage={sendMessage}
                stopResponse={stopResponse}
            />
        </div>
    );
}