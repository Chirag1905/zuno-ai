"use client";

import { useChatStore, useUIStore } from "@/app/store";
import { SidebarBrand } from "../ui/sidebarBrand";
import { IconButton } from "../ui/Icon";

export default function Sidebar() {
    const { sessions, activeSessionId, switchSession, deleteSession, newSession } = useChatStore();
    console.log("🚀 ~ Sidebar ~ sessions:", sessions)
    const { sidebarOpen, toggleSidebar } = useUIStore();

    return (
        <>
            {/* SIDEBAR */}
            <aside
                className={` ${sidebarOpen
                    ? "translate-x-0 opacity-100 pointer-events-auto"
                    : "-translate-x-full opacity-0 pointer-events-none"} 
                    absolute left-0 bg-gray-900 top-0 bottom-0 z-999 w-80 m-3 p-5 flex flex-col gap-4 rounded-4xl transition-all duration-500 ease-in-out`}
            >
                <div className="flex items-center justify-between mb-3">
                    <SidebarBrand />
                    {/* <h1 className="text-3xl font-bold tracking-wide text-blue-500 pl-1">
                        Zuno AI
                    </h1> */}
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
                    onClick={newSession}
                />
                {/* History List */}
                <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                    {sessions.map((s) => (
                        <div
                            key={s.id}
                            className={`flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-800 ${s.id === activeSessionId ? "bg-blue-600/20 text-blue-300 " : "hover:bg-gray-800"}}`}
                        >
                            <button
                                onClick={() => switchSession(s.id)}
                                className={`truncate ${s.id === activeSessionId ? "font-bold" : ""}`}
                            >
                                {s.title}
                            </button>
                            <IconButton
                                icon="Trash"
                                size="sm"
                                compact
                                onClick={() => deleteSession(s.id)}
                            />
                        </div>
                    ))}
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
