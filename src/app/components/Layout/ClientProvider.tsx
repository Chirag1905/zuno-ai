"use client";

import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import { useUIStore } from "@/app/store";
import { Toaster } from "react-hot-toast";

export default function ClientProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { sidebarOpen } = useUIStore();

    return (
        <main className="h-screen w-screen relative">
            {/* Background glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className={`absolute inset-0 transition-transform duration-500
          ${sidebarOpen ? "translate-x-36" : "translate-x-0"}`}
                >
                    <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-225 h-225 bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-225 h-225 bg-purple-600/10 rounded-full blur-[120px]" />
                </div>
            </div>

            <div className="relative flex h-full p-4">
                <Sidebar />

                <div
                    className={`relative flex-1 flex justify-center transition-all duration-500
          ${sidebarOpen ? "pl-72" : "pl-0"}`}
                >
                    <div className="w-full max-w-4xl flex flex-col overflow-hidden rounded-4xl">
                        <Header />
                        {children}
                    </div>
                </div>
            </div>

            <Toaster position="top-right" />
        </main>
    );
}
