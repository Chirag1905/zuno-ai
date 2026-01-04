"use client";

import { useEffect, useRef } from "react";
import ChatInput from "../chat/ChatInput";
import MessageBubble from "../chat/MessageBubble";
import TypingIndicator from "../chat/TypingIndicator";
import { SidebarBrand } from "../ui/sidebarBrand";
import { useChatStore, useStreamStore } from "@/app/store";
import { useShallow } from "zustand/shallow";

export default function ChatArea({
    sendMessage,
    stopResponse,
}: {
    sendMessage: () => void;
    stopResponse: () => void;
}) {
    const typing = useStreamStore((s) => s.typing);
    const bottomRef = useRef<HTMLDivElement>(null);

    const activeSessionId = useChatStore((s) => s.activeSessionId);

    const messages = useChatStore(
        useShallow((state) => {
            const session = state.sessions.find(
                (s) => s.id === activeSessionId
            );
            return session?.messages ?? [];
        })
    );
    console.log("CHAT MESSAGES", messages);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

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
        <div className="flex-1 flex flex-col overflow-hidden transition-opacity duration-300 animate-fade-in">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="w-full max-w-205 mx-auto space-y-4">
                    {messages.map((msg, i) => {
                        const isLastMessage = i === messages.length - 1;

                        // ❌ Hide last assistant message while typing
                        if (typing && isLastMessage && !msg.isUser) {
                            return null;
                        }

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

            <ChatInput sendMessage={sendMessage} stopResponse={stopResponse} />
        </div>
    );
}
