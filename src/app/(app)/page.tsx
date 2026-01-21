"use client";

import { useState } from "react";
import { useChatStore } from "@/store";
import { SidebarBrand } from "@/components/ui/SidebarBrand";
import { useRouter } from "next/navigation";
import ChatComposer from "@/components/chat/ChatComposer";

export default function Home() {

    const router = useRouter();
    const { createNewChat, setInput } = useChatStore();
    const [localInput, setLocalInput] = useState("");

    const handleSend = async () => {
        if (!localInput.trim()) return;

        // 1️⃣ create new chat
        const chatId = await createNewChat();

        // 2️⃣ put message into global input buffer
        setInput(localInput);

        // 3️⃣ navigate to chat page
        router.push(`/c/${chatId}`);

        // 4️⃣ reset local input
        setLocalInput("");
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-300 animate-fade-in">
            <SidebarBrand />
            <p className="mt-2 mb-8 text-gray-200 font-bold text-lg">
                How can I help you?
            </p>
            <ChatComposer
                value={localInput}
                onChange={setLocalInput}
                sendMessage={handleSend}
                stopResponse={() => { }}
            />
        </div>
    );
}