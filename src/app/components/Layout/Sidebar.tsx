"use client";

import { IconButton } from "@/app/utils/Icon";
import { SidebarBrand } from "@/app/utils/sidebarBrand";
import Image from "next/image";

type ThemeKey = "glass" | "neon" | "apple" | "premium";

interface SidebarProps {
    histories: {
        today: string[];
        last30: string[];
        older: string[];
    };
    onNewChat: () => void;
    uiTheme: ThemeKey;
    toggleSidebar: () => void;
    sidebarOpen: boolean;
}

export default function Sidebar({
    histories,
    onNewChat,
    uiTheme,
    toggleSidebar,
    sidebarOpen,
}: SidebarProps) {
    const themeStyle = {
        glass: "bg-white/10 backdrop-blur-xl border-white/20",
        neon: "bg-gray-900 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]",
        apple: "bg-gray-100 text-black border-gray-300",
        premium: "bg-gray-900 border-gray-800 shadow-lg",
    };

    const HistorySection = ({ title, items }: { title: string; items: string[] }) => {
        if (items.length === 0) return null;

        return (
            <div className="space-y-1">
                <h4 className="text-xs font-semibold text-gray-400 uppercase px-2 pt-3 tracking-wide">
                    {title}
                </h4>
                {items.map((chat, i) => (
                    <button
                        key={`${title}-${i}`}
                        className="group w-full flex items-center justify-between px-4 py-3
              text-[15px] rounded-xl hover:bg-gray-800/60 transition-colors"
                    >
                        <span className="truncate">{chat}</span>
                        <IconButton
                            icon="MoreVertical"
                            size="sm"
                            variant="ghost"
                            compact
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <>
            {/* SIDEBAR */}
            <aside
                className={` ${sidebarOpen
                    ? "translate-x-0 opacity-100 pointer-events-auto"
                    : "-translate-x-full opacity-0 pointer-events-none"} ${themeStyle[uiTheme]} 
                    absolute left-0 top-0 bottom-0 z-40 w-80 m-3 p-5 flex flex-col gap-4 rounded-4xl transition-all duration-500 ease-in-out`}
            >
                {/* Brand + Close Button */}
                <div className="flex items-center justify-between mb-3">
                    <SidebarBrand />
                    {/* <h1 className="text-3xl font-bold tracking-wide text-blue-500 pl-1">
                        Zuno AI
                    </h1> */}
                    {/* <div className="relative h-50 w-50 flex items-center">
                        <Image
                            src="/zuno_logo.png"
                            alt="Zuno Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div> */}
                    <IconButton
                        icon="PanelRightOpen"
                        size="lg"
                        variant="default"
                        compact
                        onClick={toggleSidebar}
                    />
                </div>

                {/* New Chat Button */}
                <IconButton
                    icon="MessageCirclePlus"
                    text="New Chat"
                    withText
                    compact
                    size="lg"
                    className="w-full justify-center py-2.5 bg-gray-800 hover:bg-gray-700"
                    textClassName="font-semibold text-base"
                    onClick={onNewChat}
                />

                {/* History List */}
                <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                    <HistorySection title="Today" items={histories.today} />
                    <HistorySection title="30 Days" items={histories.last30} />
                    <HistorySection title="2025" items={histories.older} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-gray-400 px-3 py-2 opacity-70">
                    <span>Anonymous</span>
                    <IconButton
                        icon="MoreHorizontal"
                        size="lg"
                        variant="ghost"
                        compact
                        className="opacity-70 hover:opacity-100"
                    />
                </div>
            </aside>
        </>
    );
}