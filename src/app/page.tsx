"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import ChatArea from "./components/Layout/ChatArea";

interface Message {
  text: string;
  isUser: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uiTheme, setUiTheme] = useState<"premium" | "glass" | "neon" | "apple">("premium");
  const abortControllerRef = useRef<AbortController | null>(null);
  const stopRef = useRef(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const isPunctuation = (char: string) =>
    [".", "?", "!", "\n"].includes(char);

  const isMinorPause = (char: string) =>
    [",", ";", ":"].includes(char);

  const isCodeContext = (text: string) =>
    text.includes("```");

  const sendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userText = input;
    setMessages((prev) => [...prev, { text: userText, isUser: true }]);
    setInput("");

    setIsGenerating(true);
    setTyping(true);
    stopRef.current = false;

    let botIndex = 0;

    setMessages((prev) => {
      botIndex = prev.length;
      return [...prev, { text: "", isUser: false }];
    });

    abortControllerRef.current = new AbortController();

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText }),
      signal: abortControllerRef.current.signal,
    });

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";
    let isStreaming = true;

    setTyping(false);

    let baseSpeed = 22;

    const typeLoop = async () => {
      while (!stopRef.current && (isStreaming || buffer.length > 0)) {
        if (buffer.length === 0) {
          await sleep(12);
          continue;
        }

        const char = buffer[0];
        buffer = buffer.slice(1);
        fullText += char;

        setMessages((prev) => {
          const updated = [...prev];
          updated[botIndex] = {
            ...updated[botIndex],
            text: fullText,
          };
          return updated;
        });

        // 🎯 Smart speed control
        let delay = baseSpeed;

        if (isCodeContext(fullText)) delay = 6;        // fast code
        if (isMinorPause(char)) delay += 60;           // comma pause
        if (isPunctuation(char)) delay += 160;         // sentence pause

        // 🧠 Speed ramp (feels intelligent)
        if (fullText.length > 300) baseSpeed = 14;
        if (fullText.length > 600) baseSpeed = 10;

        await sleep(delay);
      }
    };

    typeLoop();

    try {
      while (!stopRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value);
      }
    } catch (err: unknown) {
      const isAbortError =
        err instanceof DOMException
          ? err.name === "AbortError"
          : typeof err === "object" &&
          err !== null &&
          "name" in err &&
          (err as { name?: unknown }).name === "AbortError";

      if (!isAbortError) {
        console.error(err);
      }
    }

    isStreaming = false;
    setIsGenerating(false);
    setTyping(false);
  };

  // const sendMessage = async () => {
  //   if (!input.trim()) return;

  //   const userText = input;
  //   setMessages((prev) => [...prev, { text: userText, isUser: true }]);
  //   setInput("");
  //   setTyping(true);

  //   let botIndex = 0;

  //   setMessages((prev) => {
  //     botIndex = prev.length;
  //     return [...prev, { text: "", isUser: false }];
  //   });

  //   const res = await fetch("/api/chat", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ message: userText }),
  //   });

  //   const reader = res.body?.getReader();
  //   if (!reader) return;

  //   const decoder = new TextDecoder();
  //   let buffer = "";
  //   let fullText = "";
  //   let isStreaming = true;

  //   setTyping(false);

  //   let baseSpeed = 22; // premium default

  //   const typeLoop = async () => {
  //     while (isStreaming || buffer.length > 0) {
  //       if (buffer.length === 0) {
  //         await sleep(12);
  //         continue;
  //       }

  //       const char = buffer[0];
  //       buffer = buffer.slice(1);
  //       fullText += char;

  //       setMessages((prev) => {
  //         const updated = [...prev];
  //         updated[botIndex] = {
  //           ...updated[botIndex],
  //           text: fullText,
  //         };
  //         return updated;
  //       });

  //       // 🎯 Smart speed control
  //       let delay = baseSpeed;

  //       if (isCodeContext(fullText)) delay = 6;        // fast code
  //       if (isMinorPause(char)) delay += 60;           // comma pause
  //       if (isPunctuation(char)) delay += 160;         // sentence pause

  //       // 🧠 Speed ramp (feels intelligent)
  //       if (fullText.length > 300) baseSpeed = 14;
  //       if (fullText.length > 600) baseSpeed = 10;

  //       await sleep(delay);
  //     }
  //   };

  //   typeLoop();

  //   while (true) {
  //     const { value, done } = await reader.read();
  //     if (done) break;
  //     buffer += decoder.decode(value);
  //   }

  //   isStreaming = false;
  // };

  // const sendMessage = async () => {
  //   if (!input.trim()) return;

  //   const userText = input;
  //   setMessages((prev) => [...prev, { text: userText, isUser: true }]);
  //   setInput("");
  //   setTyping(true);

  //   let botIndex = 0;

  //   setMessages((prev) => {
  //     botIndex = prev.length;
  //     return [...prev, { text: "", isUser: false }];
  //   });

  //   const res = await fetch("/api/chat", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ message: userText }),
  //   });

  //   const reader = res.body?.getReader();
  //   if (!reader) return;

  //   const decoder = new TextDecoder();
  //   let buffer = "";
  //   let isStreaming = true;

  //   setTyping(false);

  //   const TYPING_SPEED = 18;

  //   const typeLoop = () => {
  //     if (!isStreaming && buffer.length === 0) return;

  //     if (buffer.length > 0) {
  //       const nextChar = buffer[0];
  //       buffer = buffer.slice(1);

  //       setMessages((prev) => {
  //         const updated = [...prev];
  //         updated[botIndex] = {
  //           ...updated[botIndex],
  //           text: updated[botIndex].text + nextChar,
  //         };
  //         return updated;
  //       });
  //     }

  //     setTimeout(typeLoop, TYPING_SPEED);
  //   };

  //   typeLoop();

  //   while (true) {
  //     const { value, done } = await reader.read();
  //     if (done) break;
  //     buffer += decoder.decode(value);
  //   }

  //   isStreaming = false;
  // };

  // const sendMessage = async () => {
  //   if (!input.trim()) return;

  //   const userText = input;

  //   setMessages((prev) => [...prev, { text: userText, isUser: true }]);
  //   setInput("");
  //   setTyping(true);

  //   // create empty bot message
  //   let botIndex: number;

  //   setMessages((prev) => {
  //     botIndex = prev.length;
  //     return [...prev, { text: "", isUser: false }];
  //   });

  //   const res = await fetch("/api/chat", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ message: userText }),
  //   });

  //   const reader = res.body?.getReader();
  //   if (!reader) return;

  //   const decoder = new TextDecoder();

  //   setTyping(false);

  //   while (true) {
  //     const { value, done } = await reader.read();
  //     if (done) break;

  //     const chunk = decoder.decode(value);

  //     setMessages((prev) => {
  //       const updated = [...prev];
  //       updated[botIndex] = {
  //         ...updated[botIndex],
  //         text: updated[botIndex].text + chunk,
  //       };
  //       return updated;
  //     });
  //   }
  // };

  const stopResponse = () => {
    stopRef.current = true;
    abortControllerRef.current?.abort();
    setIsGenerating(false);
    setTyping(false);
  };

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
        <Sidebar
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          uiTheme={uiTheme}
          onNewChat={() => setMessages([])}
          histories={{
            today: ["Correcting React Header Component UI"],
            last30: [
              "JS Closures Examples",
              "Bind/Call/Apply",
              "Odd/Even Problem",
              "JavaScript Arrays Deep Dive",
              "Event Bubbling Capture",
            ],
            older: [
              "Multi-Tenant DB Prisma",
              "Kubernetes Basics",
              "Input Component Usage",
            ],
          }}
        />

        {/* Main Chat Area */}
        <div
          className={`relative flex-1 flex justify-center transition-all duration-500 ease-in-out
          ${sidebarOpen ? "pl-72" : "pl-0"}`}
        >
          <div
            className="w-full max-w-4xl flex flex-col overflow-hidden rounded-4xl"
          >
            <Header
              toggleSidebar={toggleSidebar}
              sidebarOpen={sidebarOpen}
              uiTheme={uiTheme}
              setUiTheme={setUiTheme}
            />
            <ChatArea
              messages={messages}
              typing={typing}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              uiTheme={uiTheme}
              stopResponse={stopResponse}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
