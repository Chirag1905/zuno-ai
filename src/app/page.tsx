"use client";
import { useState } from "react";
import Sidebar from "./components/Layout/Sidebar";
import MessageBubble from "./components/MessageBubble";
import TypingIndicator from "./components/Layout/TypingIndicator";
import ThemeToggle from "./components/ThemeToggle";
import Header from "./components/Layout/Header";
import ChatInput from "./components/Layout/ChatInput";

interface Message {
  text: string;
  isUser: boolean;
}

export default function Home() {
  const [theme, setTheme] = useState("dark");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    document.documentElement.classList.toggle("dark");
  };

  const sendMessage = async () => {
    if (!input) return;
    const userMsg = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg.text }),
    });

    const data = await res.json();
    const botMsg = { text: data.reply, isUser: false };
    setTyping(false);
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <main className="flex min-h-screen">
      <Sidebar
        onNewChat={() => setMessages([])}
        currentTheme={theme}
        toggleTheme={toggleTheme}
        histories={["My first chat", "MERN questions"]}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Chat container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} text={msg.text} isUser={msg.isUser} />
          ))}

          {typing && <TypingIndicator />}
        </div>

        {/* Container with max width */}
        <ChatInput input={input} setInput={setInput} sendMessage={sendMessage} />
      </div>
    </main>
  );
}
