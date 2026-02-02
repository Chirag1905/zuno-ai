"use client";

import { useChatStore } from "@/store";
import { useSendMessage } from "@/hooks/useSendMessage";
import ChatComposer from "@/components/user/chat/ChatComposer";
import { SidebarBrand } from "@/components/ui/SidebarBrand";

export default function Home() {
    const input = useChatStore((s) => s.input);
    const setInput = useChatStore((s) => s.setInput);
    const sendMessage = useSendMessage();
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-300 animate-fade-in">
            <SidebarBrand />
            <p className="mt-2 mb-8 text-gray-200 font-bold text-lg">
                How can I help you?
            </p>
            <ChatComposer
                value={input}
                onChange={setInput}
                sendMessage={sendMessage}
            />
        </div>
    );
}