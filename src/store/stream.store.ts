import { create } from "zustand";
import { streamChat } from "@/services/stream.api";
import { LocalModel, useChatStore, useModelStore } from "@/store";
import { detectBestModel } from "@/utils/modelRouter";

/* ================= TYPES ================= */

type SendPayload = {
    chatId: string;
    model: string;
    text: string;
    mode?: "new" | "regenerate";
};

interface StreamState {
    typing: boolean;
    generating: boolean;
    abort: AbortController | null;

    send: (payload: SendPayload) => Promise<void>;
    stop: () => void;
}

/* ================= STORE ================= */

export const useStreamStore = create<StreamState>((set, get) => ({
    typing: false,
    generating: false,
    abort: null,

    send: async ({ chatId, model, text, mode = "new" }) => {
        const { model: selectedModel, setAutoSelectedModel } =
            useModelStore.getState();

        let finalModel = model;

        // 🧠 AUTO MODE
        if (selectedModel === "auto") {
            finalModel = detectBestModel(text);
            setAutoSelectedModel(finalModel as LocalModel);
        }

        const { addMessage } = useChatStore.getState();

        // 🔹 Always create a fresh assistant message
        // (previous one is already removed for regenerate)
        const assistantMessageId = addMessage(chatId, {
            text: "",
            isUser: false,
        });

        const controller = new AbortController();

        set({
            generating: true,
            typing: true,
            abort: controller,
        });

        try {
            await streamChat({
                chatId,
                model: finalModel,
                message: text,
                signal: controller.signal,
                onChunk: (chunk) => {
                    set({ typing: false });
                    useChatStore
                        .getState()
                        .updateMessage(chatId, assistantMessageId, chunk);
                },
            });
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                useChatStore
                    .getState()
                    .updateMessage(
                        chatId,
                        assistantMessageId,
                        "⚠️ Error generating response"
                    );
            }
        } finally {
            set({
                generating: false,
                typing: false,
                abort: null,
            });
        }
    },

    stop: () => {
        get().abort?.abort();
        set({
            generating: false,
            typing: false,
            abort: null,
        });
    },
}));