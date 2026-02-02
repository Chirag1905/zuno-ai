"use client";

import Header from "@/components/user/layout/Header";
import Sidebar from "@/components/user/layout/Sidebar";
import { useChatStore, useUIStore } from "@/store";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { loadChatSessions } = useChatStore();
    const sidebarOpen = useUIStore((s) => s.sidebarOpen);

    useEffect(() => { loadChatSessions(); }, [loadChatSessions]);
    // useEffect(() => { document.documentElement.classList.add("dark"); }, []);

    return (
        <main className="h-screen w-screen relative">
            {/* Background glow */}
            {/* <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className={`absolute inset-0 transition-transform duration-500
          ${sidebarOpen ? "translate-x-36" : "translate-x-0"}`}
                >
                    <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-225 h-225 bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-225 h-225 bg-purple-600/10 rounded-full blur-[120px]" />
                </div>
            </div> */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className={`absolute inset-0 transition-transform duration-500
                            ${sidebarOpen ? "translate-x-36" : "translate-x-0"}`}
                >
                    <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-blue-600/15 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-purple-600/10 rounded-full blur-[120px]" />
                </div>
            </div>

            <div className="relative flex h-full p-4">
                <Sidebar />
                <div
                    className={`relative flex-1 flex justify-center transition-all duration-500
          ${sidebarOpen ? "pl-72" : "pl-0"}`}
                >
                    <div className="w-full max-w-4xl flex flex-col overflow-hidden rounded-4xl min-h-0">
                        <Header />
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="flex-1 flex flex-col min-h-0"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    );
}