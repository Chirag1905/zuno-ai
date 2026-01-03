"use client";
import React, { useEffect, useRef } from "react";
import TypingIndicator from "./TypingIndicator";
import MessageBubble from "../MessageBubble";
import ChatInput from "./ChatInput";
import { SidebarBrand } from "@/app/utils/sidebarBrand";

interface Message {
    text: string;
    isUser: boolean;
}

interface ChatAreaProps {
    messages: Message[];
    typing: boolean;
    input: string;
    setInput: (v: string) => void;
    sendMessage: () => void;
    uiTheme: "premium" | "glass" | "neon" | "apple";
}

const ChatArea: React.FC<ChatAreaProps> = ({
    messages,
    typing,
    input,
    setInput,
    sendMessage,
    uiTheme,
}) => {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll only when messages exist
    useEffect(() => {
        if (messages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, typing]);

    // ✅ EMPTY STATE (CENTER INPUT)
    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                {/* Logo */}
                <SidebarBrand />

                {/* Subtitle */}
                <p className="mt-2 mb-8 text-gray-200 text-lg">
                    How can I help you?
                </p>

                <ChatInput
                    input={input}
                    setInput={setInput}
                    sendMessage={sendMessage}
                    uiTheme={uiTheme}
                />
            </div>
        );
    }


    // ✅ CHAT STATE (MESSAGES + STICKY INPUT)
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* SCROLLABLE MESSAGES */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="w-full max-w-205 mx-auto space-y-4">
                    {messages.map((msg, i) => (
                        <MessageBubble
                            key={i}
                            text={msg.text}
                            isUser={msg.isUser}
                            uiTheme={uiTheme}
                        />
                    ))}

                    {typing && <TypingIndicator />}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* STICKY INPUT */}
            <ChatInput
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                uiTheme={uiTheme}
            />
        </div>
    );
};

export default ChatArea;
