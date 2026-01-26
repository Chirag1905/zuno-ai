"use client";

import { IconButton } from "@/components/user/ui/Icon";
import { useLLMStore } from "@/store";
import { useEffect } from "react";

export function LLMStatus() {
    const { online, setOnline } = useLLMStore();

    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch("/api/llm/health");
                const data = await res.json();
                setOnline(data.online);
            } catch {
                setOnline(false);
            }
        };

        check();
        // const id = setInterval(check, 5000);
        // return () => clearInterval(id);
    }, [setOnline]);

    return (
        <IconButton
            icon="CircleDot"
            size="lg"
            variant="ghost"
            iconClassName={online ? "text-green-400" : "text-red-400"}
            textClassName="text-gray-300 text-sm font-medium"
            text={`LLM ${online ? "Online" : "Offline"}`}
            compact
        />
    );
}
