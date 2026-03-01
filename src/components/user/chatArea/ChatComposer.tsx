"use client";

import Button from "@/components/ui/Button";
import ModelSelector from "@/components/ui/ModelSelector";
import { useChatStore, useStreamStore } from "@/store";
import { useEffect, useRef, useState } from "react";

type ChatComposerProps = {
    sendMessage: () => void;
    stopResponse?: () => void;
    value?: string;
    onChange?: (value: string) => void;
};

export default function ChatComposer({
    sendMessage,
    stopResponse,
    value,
    onChange,
}: ChatComposerProps) {
    const { input: storeInput, setInput } = useChatStore();
    const { generating } = useStreamStore();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isMultiline, setIsMultiline] = useState(false);

    const input = value ?? storeInput;
    const setValue = onChange ?? setInput;

    const focusInput = () => {
        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    };

    /* -------------------- Auto resize -------------------- */
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = "0px";
        const height = Math.min(el.scrollHeight, 160);
        el.style.height = height + "px";

        setIsMultiline(height > 64);
    }, [input]);

    /* -------------------- Restore focus -------------------- */
    useEffect(() => {
        if (!generating) {
            focusInput();
        }
    }, [generating]);

    return (
        <div className="w-full px-2 sm:px-4 md:px-6 pb-4">
            <div className="w-full max-w-3xl mx-auto">
                <div className="flex flex-col gap-2 px-3 sm:px-4 md:px-5 rounded-3xl bg-linear-to-t from-black/40 to-transparent backdrop-blur-xl border border-white/10 shadow-xl">

                    {/* INPUT ROW */}
                    <div
                        className={`flex gap-2 sm:gap-3 py-2 ${isMultiline ? "items-start" : "items-center"
                            }`}
                    >
                        <textarea
                            ref={textareaRef}
                            value={input}
                            rows={1}
                            disabled={generating}
                            placeholder="Message Zuno"
                            className="flex-1 bg-transparent resize-none text-sm sm:text-base text-white focus:outline-none leading-6 max-h-40 overflow-y-auto chat-input-scroll"
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Enter" &&
                                    !e.shiftKey &&
                                    !e.nativeEvent.isComposing
                                ) {
                                    e.preventDefault();
                                    sendMessage();
                                    focusInput();
                                }
                            }}
                        />

                        {/* Inline Actions (Desktop & single-line mode) */}
                        {!isMultiline && (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="hidden sm:block">
                                    <ModelSelector />
                                </div>

                                <Button
                                    icon={generating ? "Square" : "ArrowUp"}
                                    size="lg"
                                    variant="minimal"
                                    compact
                                    className="bg-gray-800 hover:bg-gray-900 rounded-full shadow-lg w-10 h-10 sm:w-auto sm:h-auto"
                                    iconClassName={
                                        generating ? "text-red-400" : "text-blue-400"
                                    }
                                    onClick={() => {
                                        if (generating) {
                                            stopResponse?.();
                                        } else {
                                            sendMessage();
                                            focusInput();
                                        }
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Bottom Actions (Multiline OR Mobile) */}
                    {(isMultiline || true) && (
                        <div className="flex justify-between sm:justify-end items-center gap-2 py-2 border-t border-white/5">

                            {/* Show model selector on mobile here */}
                            <div className="sm:hidden">
                                <ModelSelector />
                            </div>

                            {isMultiline && (
                                <div className="hidden sm:block">
                                    <ModelSelector />
                                </div>
                            )}

                            {isMultiline && (
                                <Button
                                    icon={generating ? "Square" : "ArrowUp"}
                                    size="lg"
                                    variant="minimal"
                                    compact
                                    className="bg-gray-800 hover:bg-gray-900 rounded-full shadow-lg w-10 h-10 sm:w-auto sm:h-auto"
                                    iconClassName={
                                        generating ? "text-red-400" : "text-blue-400"
                                    }
                                    onClick={() => {
                                        if (generating) {
                                            stopResponse?.();
                                        } else {
                                            sendMessage();
                                            focusInput();
                                        }
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}