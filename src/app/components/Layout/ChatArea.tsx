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
    setInput: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void;
    stopResponse?: () => void;
    isGenerating?: boolean;
    uiTheme: "premium" | "glass" | "neon" | "apple";
}

const ChatArea: React.FC<ChatAreaProps> = ({
    messages,
    typing,
    input,
    setInput,
    sendMessage,
    stopResponse = () => { },
    isGenerating = false,
    uiTheme,
}) => {
    const bottomRef = useRef<HTMLDivElement | null>(null);

    // Auto scroll when new messages or typing
    useEffect(() => {
        if (messages.length > 0) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, typing]);

    // ✅ EMPTY STATE (CENTERED INPUT)
    if (messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <SidebarBrand />

                <p className="mt-2 mb-8 text-gray-200 text-lg">
                    How can I help you?
                </p>

                <ChatInput
                    input={input}
                    setInput={setInput}
                    sendMessage={sendMessage}
                    stopResponse={stopResponse}
                    isGenerating={isGenerating}
                    uiTheme={uiTheme}
                />
            </div>
        );
    }

    // ✅ CHAT STATE
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
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
                                uiTheme={uiTheme}
                            />
                        );
                    })}
                    {typing && <TypingIndicator />}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Sticky Input */}
            <ChatInput
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                stopResponse={stopResponse}
                isGenerating={isGenerating}
                uiTheme={uiTheme}
            />
        </div>
    );
};

export default ChatArea;
