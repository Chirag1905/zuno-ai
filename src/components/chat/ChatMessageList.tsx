"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/chat";
import ChatTypingIndicator from "@/components/chat/ChatTypingIndicator";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";

type ChatMessageListProps = {
    messages: readonly ChatMessage[];
    typing: boolean;
};

export default function ChatMessageList({
    messages,
    typing,
}: ChatMessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);

    return (
        <div className="w-full max-w-205 mx-auto px-2 space-y-4">
            {messages.map((msg, index) => {
                const isLastMessage = index === messages.length - 1;

                // Avoid rendering last assistant message when streaming
                if (typing && isLastMessage && !msg.isUser) return null;
                return (
                    <ChatMessageBubble
                        key={`${msg.isUser}-${index}`}
                        text={msg.text}
                        isUser={msg.isUser}
                    />
                );
            })}

            {typing && <ChatTypingIndicator />}
            <div ref={bottomRef} />
        </div>
    );
}