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
    /* ----------------------------- Store State ----------------------------- */
    const activeChatId = useChatStore((s) => s.activeChatId);
    const messagesByChat = useChatStore((s) => s.messagesByChat);
    const typing = useStreamStore((s) => s.typing);

    /* ------------------------------ Memoized Data --------------------------- */
    const messages = useMemo<readonly ChatMessage[]>(() => {
        if (!activeChatId) return EMPTY_MESSAGES;
        return messagesByChat[activeChatId] ?? EMPTY_MESSAGES;
    }, [activeChatId, messagesByChat]);

    /* ------------------------------ Refs ------------------------------------ */
    const scrollRef = useRef<HTMLDivElement | null>(null) as React.RefObject<HTMLDivElement>;
    const bottomRef = useRef<HTMLDivElement | null>(null) as React.RefObject<HTMLDivElement>;

    /* ------------------------------ State ----------------------------------- */
    // const [showScrollDown, setShowScrollDown] = useState<boolean>(false);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);

    /* ------------------------------ Helpers ---------------------------------- */
    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);
    /* ------------------------------ Scroll Tracking -------------------------- */
    const handleScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const THRESHOLD = 120;

        const atBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD;

        setIsAtBottom(atBottom);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        el.addEventListener("scroll", handleScroll);
        handleScroll(); // initial check

        return () => el.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    /* ------------------------------ Auto Scroll ------------------------------ */
    useEffect(() => {
        // ONLY auto-scroll if user is already at bottom
        if (isAtBottom) {
            scrollToBottom();
        }
    }, [messages, typing, isAtBottom, scrollToBottom]);

    /* ------------------------------ Empty State ------------------------------ */
    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-300 animate-fade-in">
                <SidebarBrand />
                <p className="mt-2 mb-8 text-gray-200 font-bold text-lg">
                    How can I help you?
                </p>
                <ChatComposer
                    sendMessage={sendMessage}
                    stopResponse={stopResponse}
                />
            </div>
        );
    }

    /* ------------------------------ Chat UI ---------------------------------- */
    return (
        <div className="relative flex-1 flex flex-col overflow-hidden transition-opacity duration-300 animate-fade-in">
            <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto py-6 chat-scroll"
            >
                <ChatMessageList
                    messages={messages}
                    typing={typing}
                    bottomRef={bottomRef}
                />
            </div>

            {!isAtBottom && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md rounded-full hover:scale-105 transition-all"
                >
                    <Button
                        icon="ArrowDown"
                        size="lg"
                        variant="default"
                        onClick={scrollToBottom}
                    />
                </div>
            )}

            <ChatComposer
                sendMessage={sendMessage}
                stopResponse={stopResponse}
            />
        </div>
    );
}
