"use client";

import { useCallback, useEffect, useRef } from "react";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import ChatArea from "./components/Layout/ChatArea";
import { useChatStore, useStreamStore, useUIStore } from "./store";

export default function Home() {
  const { messages, input, activeSessionId, setInput, addMessage, updateMessage, clearMessages } = useChatStore();

  const { theme, sidebarOpen, setTheme, toggleSidebar } = useUIStore();
  const { typing, generating, setTyping, setGenerating } = useStreamStore();

  const abortControllerRef = useRef<AbortController | null>(null);
  const stopRef = useRef(false);

  const sleep = (ms: number) =>
    new Promise((r) => setTimeout(r, ms));

  const sendMessage = async () => {
    if (!input.trim() || generating) return;

    const userText = input.trim();

    addMessage({ text: userText, isUser: true });
    setInput("");
    setGenerating(true);
    setTyping(true);
    stopRef.current = false;

    const assistantId = addMessage({
      text: "",
      isUser: false,
    });

    if (!assistantId) {
      setGenerating(false);
      setTyping(false);
      return;
    }

    abortControllerRef.current = new AbortController();

    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    let isStreaming = false;
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        updateMessage(
          assistantId,
          errText || `Request failed: ${res.status} ${res.statusText}`
        );
        return;
      }

      reader = res.body?.getReader();
      if (!reader) {
        updateMessage(assistantId, "No response body from server.");
        return;
      }

      isStreaming = true;

      setTyping(false);
      await sleep(280);

      let baseSpeed = 22;

      const typeLoop = async () => {
        while (!stopRef.current && (isStreaming || buffer.length)) {
          if (!buffer.length) {
            await sleep(12);
            continue;
          }

          const char = buffer[0];
          buffer = buffer.slice(1);
          fullText += char;

          updateMessage(assistantId, fullText);

          let delay = baseSpeed;
          if (",;:".includes(char)) delay += 60;
          if (".?!\n".includes(char)) delay += 160;
          if (fullText.includes("```")) delay = 6;

          if (fullText.length > 300) baseSpeed = 14;
          if (fullText.length > 600) baseSpeed = 10;

          await sleep(delay);
        }
      };

      typeLoop();

      while (!stopRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value);
      }
    } catch (err) {
      if (!stopRef.current) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        updateMessage(assistantId, `Error: ${msg}`);
      }
    } finally {
      isStreaming = false;
      try {
        await reader?.cancel();
      } catch {
        // ignore
      }
      setGenerating(false);
      setTyping(false);
    }
  };

  const stopResponse = useCallback(() => {
    stopRef.current = true;
    abortControllerRef.current?.abort();
    setGenerating(false);
    setTyping(false);
  }, [setGenerating, setTyping]);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    stopResponse();
  }, [activeSessionId, stopResponse]);

  // ESC to stop
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && generating) stopResponse();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [generating, stopResponse]);

  return (
    <main className="h-screen w-screen bg-gray-950 text-white overflow-hidden">
      {/* premium radial glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`
      absolute inset-0
      transition-transform duration-500 ease-in-out
      ${sidebarOpen ? "translate-x-36" : "translate-x-0"}
    `}
        >
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-225 h-225 bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-225 h-225 bg-purple-600/10 rounded-full blur-[120px]" />
        </div>
      </div>

      {/* Sidebar */}
      <div className="relative flex h-full p-4">
        <Sidebar />

        {/* Main Chat Area */}
        <div
          className={`relative flex-1 flex justify-center transition-all duration-500 ease-in-out
          ${sidebarOpen ? "pl-72" : "pl-0"}`}
        >
          <div className="w-full max-w-4xl flex flex-col overflow-hidden rounded-4xl">
            <Header />
            <ChatArea
              sendMessage={sendMessage}
              stopResponse={stopResponse}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
