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
    <main className="flex min-h-screen p-5 bg-gray-950 text-white overflow-hidden">
      {/* premium radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-225 h-225 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-225 h-225 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>
      {/* Sidebar */}
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
      <div className="flex-1 flex flex-col">
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
    </main>
  );
}
