"use client";

import { useState, type ReactNode } from "react";
import { useUIStore } from "../../store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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

    if (inline) {
        return (
            <code className="px-1 py-0.5 rounded bg-black/40 text-blue-300">
                {children}
            </code>
        );
    }

    return (
        <div className="relative mt-3 mb-3">
            <button
                onClick={() => {
                    navigator.clipboard.writeText(codeText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                }}
                className="absolute right-3 top-3 text-xs px-2 py-1 rounded-md
                    bg-black/60 text-white hover:bg-black/80"
            >
                {copied ? "Copied" : "Copy"}
            </button>

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

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`relative max-w-full min-w-0 rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser ? "bg-blue-600 text-white rounded-br-md" : `${themeClass} rounded-bl-md`}`}
            >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code: CodeBlock,
                    }}
                >
                    {text}
                </ReactMarkdown>
            </div>
        </div>
    );
}
