"use client";

import ChatMessageBubble from "@/components/user/chat/ChatMessageBubble";
import ChatTypingIndicator from "@/components/user/chat/ChatTypingIndicator";
import type { ChatMessage } from "@/types/chat";

type ChatMessageListProps = {
    messages: readonly ChatMessage[];
    typing: boolean;
    bottomRef?: React.RefObject<HTMLDivElement>;
};

export default function ChatMessageList({
    messages,
    typing,
    bottomRef,
}: ChatMessageListProps) {

    return (
        <div className="w-full max-w-205 mx-auto px-2 space-y-4">
            {messages.map((msg, index) => {
                const isLast = index === messages.length - 1;
                // Avoid rendering last assistant message when streaming
                if (typing && isLast && !msg.isUser) return null;
                return (
                    <ChatMessageBubble
                        key={msg.id}
                        text={msg.text}
                        isUser={msg.isUser}
                        isLast={isLast}
                    />
                );
            })}

            {typing && <ChatTypingIndicator />}
            <div ref={bottomRef} />
        </div>
    );
}