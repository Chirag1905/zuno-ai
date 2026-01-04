"use client";

import { useRef, useEffect, type Dispatch, type SetStateAction } from "react";
import { IconButton } from "@/app/utils/Icon";

type ChatInputProps = {
    input: string;
    setInput: Dispatch<SetStateAction<string>>;
    sendMessage: () => void;
    uiTheme: string;
    stopResponse: () => void;
    isGenerating: boolean;
};

export default function ChatInput({
    input,
    setInput,
    sendMessage,
    uiTheme,
    stopResponse,
    isGenerating
}: ChatInputProps) {
    console.log("🚀 ~ ChatInput ~ isGenerating:", isGenerating)
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // 🔥 Auto-resize logic
    useEffect(() => {
        if (!textareaRef.current) return;

        textareaRef.current.style.height = "0px";
        const scrollHeight = textareaRef.current.scrollHeight;

        // max height ~ 6 lines (like DeepSeek)
        textareaRef.current.style.height = Math.min(scrollHeight, 160) + "px";
    }, [input]);

    return (
        <div className="w-full flex justify-center">
            <div className="w-full max-w-205 flex items-center gap-3 px-5 py-2.5 rounded-4xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
                <textarea
                    ref={textareaRef}
                    className="flex-1 bg-transparent resize-none text-sm text-white placeholder:text-gray-400 focus:outline-none leading-6 max-h-40 overflow-y-auto"
                    placeholder="Message Zuno"
                    value={input}
                    rows={1}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />

                <IconButton
                    icon={isGenerating ? "Square" : "ArrowUp"}
                    size="lg"
                    variant="minimal"
                    compact
                    iconClassName={isGenerating ? "text-red-400" : "text-blue-400"}
                    className="bg-gray-800 hover:bg-gray-700 rounded-full"
                    onClick={isGenerating ? stopResponse : sendMessage}
                />
            </div>
        </div>
    );
}
