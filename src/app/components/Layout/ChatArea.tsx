"use client";
import React from "react";
import TypingIndicator from "./TypingIndicator";
import MessageBubble from "../MessageBubble";

interface Message {
    text: string;
    isUser: boolean;
}

interface ChatAreaProps {
    messages: Message[];
    typing: boolean;
    uiTheme: "premium" | "glass" | "neon" | "apple";
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, typing, uiTheme }) => {
    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
                <MessageBubble
                    key={i}
                    text={msg.text}
                    isUser={msg.isUser}
                    uiTheme={uiTheme}
                />
            ))}
            {typing && <TypingIndicator />}
        </div>
    );
};

export default ChatArea;
