"use client";

import { useChatStore, useStreamStore } from "@/app/store";
import { useEffect, useRef } from "react";
import { IconButton } from "@/app/components/ui/Icon";

export default function ChatInput({
    sendMessage,
    stopResponse,
}: {
    sendMessage: () => void;
    stopResponse: () => void;
}) {
    const { input, setInput } = useChatStore();
    const { generating } = useStreamStore();

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = "0px";
        textareaRef.current.style.height =
            Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }, [input]);

    return (
        <div className="w-full pb-4">
            <div className="w-full max-w-210 mx-auto px-2">
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-4xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
                    <textarea
                        ref={textareaRef}
                        className="flex-1 bg-transparent resize-none text-sm text-white placeholder:text-gray-400 focus:outline-none leading-6 max-h-40 overflow-y-auto"
                        placeholder="Message Zuno"
                        value={input}
                        rows={1}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (
                                e.key === "Enter" &&
                                !e.shiftKey &&
                                !e.nativeEvent.isComposing
                            ) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        disabled={generating}
                    />

                    <IconButton
                        icon={generating ? "Square" : "ArrowUp"}
                        size="lg"
                        variant="minimal"
                        compact
                        className="bg-gray-800 hover:bg-gray-700 rounded-full"
                        iconClassName={generating ? "text-red-400" : "text-blue-400"}
                        onClick={generating ? stopResponse : sendMessage}
                    />
                </div>
            </div>
        </div>
    );
}
