"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useUIStore } from "../../store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { IconButton } from "../ui/Icon";

const styles = {
    glass: "bg-white/10 backdrop-blur-md border border-white/20",
    neon: "bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_12px_rgba(138,43,226,0.4)]",
    apple: "bg-white text-gray-900 border border-gray-200 shadow-md",
    premium: "bg-gray-800 text-gray-100 border border-gray-700 shadow-md",
};

function CodeBlock({
    inline,
    className,
    children,
}: {
    inline?: boolean;
    className?: string;
    children?: ReactNode;
}) {
    const match = /language-(\w+)/.exec(className || "");
    const codeText = String(children).replace(/\n$/, "");
    const [copied, setCopied] = useState(false);

    // ✅ Inline code → stays inline (no div)
    if (inline) {
        return (
            <code className="px-1 py-0.5 rounded bg-black/40 text-blue-300">
                {children}
            </code>
        );
    }

    // ✅ Block code → wrapped safely
    return (
        <div className="relative my-3">
            {/* COPY BUTTON */}
            <div className="absolute right-2 top-2 z-10 opacity-100 transition-opacity duration-200">
                <IconButton
                    icon={copied ? "Check" : "Copy"}
                    size="sm"
                    variant="ghost"
                    text={copied ? "Copied" : "Copy"}
                    withText
                    textClassName="text-sm text-gray-100"
                    className="bg-black/60 hover:bg-black/10 px-2"
                    onClick={() => {
                        navigator.clipboard.writeText(codeText);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                    }}
                />
            </div>
            <SyntaxHighlighter
                language={match?.[1] || "javascript"}
                style={vscDarkPlus}
                PreTag="div"
                customStyle={{
                    borderRadius: "18px",
                    padding: "16px",
                    fontSize: "14px",
                    background: "rgba(0,0,0,0.75)",
                }}
            >
                {codeText}
            </SyntaxHighlighter>
        </div>
    );
}

export default function MessageBubble({
    text,
    isUser,
}: {
    text: string;
    isUser: boolean;
}) {
    const theme = useUIStore((s) => s.theme);
    const themeClass = styles[theme];

    const [hovered, setHovered] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(text);
    const [copied, setCopied] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!textareaRef.current) return;
        textareaRef.current.style.height = "0px";
        textareaRef.current.style.height =
            Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }, [draft]);

    return (
        <div
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div
                className={`flex flex-col ${isUser ? "items-end" : "items-start"
                    }`}
            >

                {/* MESSAGE BUBBLE */}
                <div
                    className={`relative min-w-0 rounded-2xl text-sm leading-relaxed
        ${editing && isUser
                            ? "w-full px-5 py-2 bg-white/5 backdrop-blur-xl border border-white/10"
                            : `px-3 py-2 ${isUser ? "bg-blue-600 text-white" : themeClass}`
                        }`}
                >
                    {/* EDIT MODE */}
                    {editing ? (
                        <div className="w-full">
                            <textarea
                                ref={textareaRef}
                                className="w-full flex-1 bg-transparent resize-none text-sm text-white placeholder:text-gray-400 focus:outline-none leading-6 max-h-40 overflow-y-auto"
                                placeholder="Message Zuno"
                                value={draft}
                                rows={1}
                                onChange={(e) => setDraft(e.target.value)}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        !e.shiftKey &&
                                        !e.nativeEvent.isComposing
                                    ) {
                                        e.preventDefault();
                                        // sendMessage();
                                        console.log("SEND EDITED MESSAGE", draft);
                                    }
                                }}
                            // disabled={generating}
                            />
                            <div className="flex justify-end gap-2">
                                <IconButton
                                    icon="X"
                                    size="md"
                                    variant="default"
                                    text="Cancel"
                                    compact
                                    className="px-3"
                                    textClassName="text-sm font-semibold"
                                    onClick={() => {
                                        setDraft(text);
                                        setEditing(false);
                                    }}
                                />
                                <IconButton
                                    icon="Check"
                                    size="md"
                                    variant="default"
                                    text="Save"
                                    compact
                                    className="px-3 bg-gray-500!"
                                    textClassName="text-sm font-semibold"
                                    onClick={() => {
                                        // 🔥 connect to store updateMessage(id, draft)
                                        setEditing(false);
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                pre: ({ children }) => <>{children}</>,
                                code: CodeBlock,
                            }}
                        >
                            {text}
                        </ReactMarkdown>
                    )}
                </div>
                {/* USER ACTIONS (ChatGPT-like) */}
                {!editing && (
                    <div
                        className={`mt-1 flex gap-1 items-center px-2 py-1 transition-all duration-300 ease-out 
                            ${isUser ? "self-end" : "self-start"}
                            ${hovered
                                ? "opacity-100 translate-y-0 scale-100"
                                : "opacity-0 -translate-y-1 scale-95 pointer-events-none"}
                            `}
                    >
                        <IconButton
                            icon={copied ? "Check" : "Copy"}
                            size="sm"
                            variant="ghost"
                            className="hover:bg-white/10 hover:scale-105 active:scale-95"
                            onClick={() => {
                                navigator.clipboard.writeText(text);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1200);
                            }}
                        />

                        {/* EDIT — ONLY for USER messages */}
                        {isUser && (
                            <IconButton
                                icon="Pencil"
                                size="sm"
                                variant="ghost"
                                className="hover:bg-white/10 hover:scale-105 active:scale-95"
                                onClick={() => setEditing(true)}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}