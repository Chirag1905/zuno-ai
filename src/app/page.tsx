"use client";
import { useState, useEffect } from "react";
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
            />
          </div>
        </div>
      </div>
    </main>
  );
}
