"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChatStore, useStreamStore } from "@/store";
import { IconButton } from "@/components/ui/Icon";
import { ChatMessage } from "@/types/chat";
import { SidebarBrand } from "@/components/ui/SidebarBrand";
import ChatComposer from "@/components/chat/ChatComposer";
import ChatMessageList from "@/components/chat/ChatMessageList";

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
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    /* ------------------------------ State ----------------------------------- */
    const [showScrollDown, setShowScrollDown] = useState<boolean>(false);
    /* ------------------------------ Callbacks -------------------------------- */
    const updateScrollDownVisibility = useCallback((): void => {
        const el = scrollRef.current;
        if (!el) return;

        const THRESHOLD_PX = 120;

        const isOverflowing = el.scrollHeight > el.clientHeight;
        const atBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD_PX;

        setShowScrollDown(isOverflowing && !atBottom);
    }, []);

    const scrollToBottom = useCallback((): void => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    /* ------------------------------ Effects ---------------------------------- */
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => updateScrollDownVisibility();

        el.addEventListener("scroll", handleScroll);
        handleScroll(); // initial calculation

        return () => el.removeEventListener("scroll", handleScroll);
    }, [updateScrollDownVisibility]);

    useEffect(() => {
        if (!showScrollDown) {
            scrollToBottom();
        }
    }, [messages, typing, showScrollDown, scrollToBottom]);

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
                className="flex-1 min-h-0 overflow-y-auto py-6"
            >
                <ChatMessageList messages={messages} typing={typing} />
            </div>

            {showScrollDown && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md
    rounded-full hover:scale-105 transition-all"
                >
                    <IconButton
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
