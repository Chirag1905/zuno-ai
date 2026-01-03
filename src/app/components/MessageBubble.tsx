"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
    funky,
    vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";

const styles = {
    glass: "bg-white/10 backdrop-blur-md border border-white/20",
    neon: "bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_12px_rgba(138,43,226,0.4)]",
    apple: "bg-white text-gray-900 border border-gray-200 shadow-md",
    premium: "bg-gray-800 text-gray-100 border border-gray-700 shadow-md",
};

type UITheme = keyof typeof styles;

type MessageBubbleProps = {
    text: string;
    isUser: boolean;
    uiTheme?: UITheme;
};

type MarkdownCodeProps = React.HTMLAttributes<HTMLElement> & {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
};

function MarkdownCode({ inline, className, children, ...props }: MarkdownCodeProps) {
    const match = /language-(\w+)/.exec(className || "");
    const [copied, setCopied] = useState(false);

    const codeText = String(children).replace(/\n$/, "");
    const isInline = inline ?? (!match && !codeText.includes("\n"));

    if (isInline) {
        return (
            <code
                {...props}
                className="px-1 py-0.5 rounded bg-black/40 text-blue-300 wrap-break-word"
            >
                {children}
            </code>
        );
    }

    return (
        <div className="relative mt-3 mb-3 max-w-full">
            {/* Copy Button */}
            <button
                onClick={() => {
                    navigator.clipboard.writeText(codeText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                }}
                className="absolute right-3 top-3 z-10 text-xs px-2 py-1 rounded-md
                bg-black/60 text-white hover:bg-black/80 transition"
            >
                {copied ? "Copied" : "Copy"}
            </button>

            <SyntaxHighlighter
                language={match?.[1] || "javascript"}
                style={vscDarkPlus}
                PreTag="div"
                wrapLongLines={false}
                customStyle={{
                    maxWidth: "100%",
                    overflowX: "auto",
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
    uiTheme = "premium",
}: MessageBubbleProps) {
    const themeClass = styles[uiTheme];

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`relative max-w-full min-w-0 rounded-2xl px-4 py-3 text-sm leading-relaxed
                    ${isUser
                        ? "bg-blue-600 text-white rounded-br-md"
                        : `${themeClass} rounded-bl-md`
                    }`}
            >

                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code: MarkdownCode,

                        p({ children }) {
                            return <p className="mb-5 last:mb-0">{children}</p>;
                        },

                        ul({ children }) {
                            return <ul className="list-disc ml-5 space-y-1">{children}</ul>;
                        },

                        ol({ children }) {
                            return <ol className="list-decimal ml-5 space-y-1">{children}</ol>;
                        },

                        h1({ children }) {
                            return <h1 className="text-lg font-semibold mb-3">{children}</h1>;
                        },

                        h2({ children }) {
                            return <h2 className="text-base font-semibold mb-3">{children}</h2>;
                        },
                    }}
                >
                    {text}
                </ReactMarkdown>
            </div>
        </div>
    );
}
