"use client";

import { useCallback, useEffect, useRef } from "react";
import ChatArea from "@/components/Layout/ChatArea";
import { useChatStore, useLLMStore, useModelStore, useStreamStore, useUIStore } from "@/app/store";
import { useParams } from "next/navigation";


export default function ChatPage() {

    const params = useParams();
    const chatId = params.chatId as string;

    const {
        input,
        activeChatId,
        setInput,
        addMessage,
        updateMessage,
        ensureChatSession,
        loadChatSessions,
        switchChat
    } = useChatStore();

    useEffect(() => {
        if (!chatId) return;
        switchChat(chatId);
    }, [chatId, switchChat]);

    const { generating, setTyping, setGenerating } = useStreamStore();
    const { model } = useModelStore();
    const { online } = useLLMStore();

    /* ================= REFS ================= */

    const abortControllerRef = useRef<AbortController | null>(null);
    const stopRef = useRef(false);

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    /* ================= SEND MESSAGE ================= */

    const sendMessage = async () => {
        if (!input.trim() || generating) return;

        // ✅ ensure chat exists
        const chatId = await ensureChatSession();
        const userText = input.trim();

        // ✅ optimistic user message (chat-scoped)
        addMessage(chatId, { text: userText, isUser: true });
        setInput("");

        // ✅ assistant placeholder
        const assistantMessageId = addMessage(chatId, {
            text: "",
            isUser: false,
        });

        setGenerating(true);
        setTyping(true);
        stopRef.current = false;

        // ❌ LLM offline guard
        if (!online) {
            updateMessage(
                chatId,
                assistantMessageId,
                "⚠️ Local LLM is offline.\n\nStart Ollama to continue."
            );
            setGenerating(false);
            setTyping(false);
            return;
        }

        abortControllerRef.current = new AbortController();

        let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
        let buffer = "";
        let fullText = "";
        let streaming = true;
        const decoder = new TextDecoder();

        try {
            // ⚠️ fetch is REQUIRED for streaming (axios breaks web streams)
            const res = await fetch("/api/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatId,
                    model,
                    message: userText,
                }),
                signal: abortControllerRef.current.signal,
            });

            reader = res.body?.getReader();
            if (!reader) throw new Error("No stream reader");

            setTyping(false);
            await sleep(150);

            // ✍️ typing animation loop
            const typingLoop = async () => {
                while (!stopRef.current && (streaming || buffer.length)) {
                    if (!buffer.length) {
                        await sleep(8);
                        continue;
                    }

                    const char = buffer[0];
                    buffer = buffer.slice(1);
                    fullText += char;

                    updateMessage(chatId, assistantMessageId, fullText);
                    await sleep(10);
                }
            };

            typingLoop();

            // 📡 read stream
            while (!stopRef.current) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value);
            }
        } catch (error) {
            updateMessage(
                chatId,
                assistantMessageId,
                error instanceof Error ? error.message : "Unknown error"
            );
        } finally {
            streaming = false;
            reader?.cancel();
            setGenerating(false);
            setTyping(false);
        }
    };

    /* ================= STOP ================= */

    const stopResponse = useCallback(() => {
        stopRef.current = true;
        abortControllerRef.current?.abort();
        setGenerating(false);
        setTyping(false);
    }, [setGenerating, setTyping]);

    /* ================= EFFECTS ================= */

    useEffect(() => {
        loadChatSessions();
    }, [loadChatSessions]);

    useEffect(() => {
        stopResponse();
    }, [activeChatId, stopResponse]);

    useEffect(() => {
        document.documentElement.classList.add("dark");
    }, []);

    // ESC key support
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && generating) stopResponse();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [generating, stopResponse]);

    const hasSentInitialMessage = useRef(false);

    useEffect(() => {
        if (!chatId) return;
        if (!input.trim()) return;
        if (hasSentInitialMessage.current) return;

        hasSentInitialMessage.current = true;
        sendMessage();
    }, [chatId]);

    return <ChatArea
        sendMessage={sendMessage}
        stopResponse={stopResponse}
    />
}
