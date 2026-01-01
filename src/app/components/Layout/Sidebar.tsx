"use client";
import { Plus, MessageSquare } from "lucide-react";

interface SidebarProps {
    histories: string[];
    onNewChat: () => void;
    currentTheme: string;
    toggleTheme: () => void;
}

export default function Sidebar({
    histories,
    onNewChat,
    currentTheme,
    toggleTheme,
}: SidebarProps) {
    return (
        <div className="hidden md:flex flex-col w-86 bg-gray-900 backdrop-blur-xl border-r border-gray-900 p-4 gap-3">
            <h1 className="text-2xl font-bold text-blue-500 tracking-wide">
                Zuno
            </h1>

            <button
                onClick={onNewChat}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
                <Plus size={18} /> New Chat
            </button>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {histories?.map((h: string, i: number) => (
                    <button
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded bg-gray-800/50 hover:bg-gray-800 transition text-sm truncate"
                    >
                        <MessageSquare size={16} /> {h}
                    </button>
                ))}
            </div>
        </div>
    );
}