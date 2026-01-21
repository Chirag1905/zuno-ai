"use client";

import { useModelStore } from "@/store";

export function ModelSelector() {
    const { model, setModel } = useModelStore();

    return (
        <select
            value={model}
            onChange={(e) => setModel(e.target.value as Parameters<typeof setModel>[0])}
            className="bg-gray-800 text-white px-3 py-2 rounded-lg"
        >
            <option value="llama">Llama 3.1 (General)</option>
            <option value="mistral">Mistral (Fast)</option>
            <option value="qwen">Qwen 2.5 (Reasoning)</option>
            <option value="deepseek">DeepSeek R1 (Code)</option>
        </select>
    );
}
