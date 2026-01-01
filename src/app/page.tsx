"use client";
import { useState, useEffect } from "react";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import MessageBubble from "./components/MessageBubble";
import ChatInput from "./components/Layout/ChatInput";
import TypingIndicator from "./components/Layout/TypingIndicator";
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
  const [uiTheme, setUiTheme] =
    useState<"premium" | "glass" | "neon" | "apple">("premium");

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    const botMsg = { text: data.reply, isUser: false };

    setTyping(false);
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <main className="flex min-h-screen p-5 bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen
          ? "visible translate-x-0"
          : "invisible -translate-x-full"
          } transition-all duration-400 ease-in-out`}
      >
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
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <Header
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          uiTheme={uiTheme}
          setUiTheme={setUiTheme}
        />

        <ChatArea messages={messages} typing={typing} uiTheme={uiTheme} />

        <ChatInput
          input={input}
          setInput={setInput}
          sendMessage={sendMessage}
          uiTheme={uiTheme}
        />
      </div>
    </main>
  );
}
