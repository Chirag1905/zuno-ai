"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChatStore, useStreamStore } from "@/app/store";
import { SidebarBrand } from "@/components/ui/sidebarBrand";
import ChatInput from "@/components/chat/ChatInput";
import MessageBubble from "@/components/chat/MessageBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { IconButton } from "@/components/ui/Icon";

/* ================= CONSTANT ================= */

// ✅ stable empty array (never recreated)
const EMPTY_MESSAGES: readonly any[] = [];

export default function ChatArea({
    sendMessage,
    stopResponse,
}: {
    sendMessage: () => void;
    stopResponse: () => void;
}) {
    // const messages = useChatStore((s) => s.getMessagesForActiveChat());
    // const typing = useStreamStore((s) => s.typing);
    // ✅ select ONLY primitives / stable references
    const activeChatId = useChatStore((s) => s.activeChatId);
    const messagesByChat = useChatStore((s) => s.messagesByChat);
    const typing = useStreamStore((s) => s.typing);

    // ✅ derive messages with memo (stable)
    const messages = useMemo(() => {
        if (!activeChatId) return EMPTY_MESSAGES;
        return messagesByChat[activeChatId] ?? EMPTY_MESSAGES;
    }, [activeChatId, messagesByChat]);


    console.log("🚀 ~ ChatArea ~ messages:", messages)

    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollDown, setShowScrollDown] = useState(false);

    const updateScrollDownVisibility = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const threshold = 120; // px from bottom
        const isOverflowing = el.scrollHeight > el.clientHeight;
        const atBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

        setShowScrollDown(isOverflowing && !atBottom);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const handleScroll = () => {
            updateScrollDownVisibility();
        };

        el.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => el.removeEventListener("scroll", handleScroll);
    }, [updateScrollDownVisibility]);

    useEffect(() => {
        if (!showScrollDown) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, typing, showScrollDown]);

    //       const updateScroll = useCallback(() => {
    //     const el = scrollRef.current;
    //     if (!el) return;

    //     const atBottom =
    //       el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    //     setShowScrollDown(!atBottom);
    //   }, []);

    //   useEffect(() => {
    //     updateScroll();
    //   }, [messages, typing, updateScroll]);

    //   useEffect(() => {
    //     if (!showScrollDown) {
    //       bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    //     }
    //   }, [messages, typing, showScrollDown]);

    // ✅ EMPTY STATE (CENTERED INPUT)
    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-300 animate-fade-in">
                <SidebarBrand />
                <p className="mt-2 mb-8 text-gray-200 text-lg">
                    How can I help you?
                </p>
                <ChatInput sendMessage={sendMessage} stopResponse={stopResponse} />
            </div>
        );
    }

    // ✅ CHAT STATE
    return (
        // <div className="flex-1 flex flex-col overflow-hidden transition-opacity duration-300 animate-fade-in">
        <div className="relative flex-1 flex flex-col overflow-hidden transition-opacity duration-300 animate-fade-in">
            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto py-6"
            >
                <div className="w-full max-w-205 mx-auto px-2 space-y-4">
                    {messages?.map((msg, i) => {
                        console.log("🚀 ~ ChatArea ~ msg:", msg)
                        const isLastMessage = i === messages.length - 1;

                        // ❌ Hide last assistant message while typing
                        if (typing && isLastMessage && !msg.isUser) return null;

                        return (
                            <MessageBubble
                                key={i}
                                text={msg.text}
                                isUser={msg.isUser}
                            />
                        );
                    })}
                    {typing && <TypingIndicator />}
                    <div ref={bottomRef} />
                </div>
            </div>

            {showScrollDown && (
                <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-50 bg-black/60 backdrop-blur-md
    rounded-full hover:scale-105 transition-all"
                >
                    <IconButton
                        icon="ArrowDown"
                        size="lg"
                        variant="default"
                        onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                    />
                </div>
            )}

            <ChatInput sendMessage={sendMessage} stopResponse={stopResponse} />
        </div>
    );
}
