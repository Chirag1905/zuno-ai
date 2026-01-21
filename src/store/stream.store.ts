import { create } from "zustand";
import { streamChat } from "@/services/stream.api";
import { LocalModel, useChatStore, useModelStore } from "@/store";
import { detectBestModel } from "@/utils/modelRouter";

/* ================= TYPES ================= */

type SendPayload = {
    chatId: string;
    model: string;
    text: string;
};

interface StreamState {
    typing: boolean;
    generating: boolean;
    abort: AbortController | null;

    send: (payload: SendPayload) => Promise<void>;
    stop: () => void;
    setTyping: (v: boolean) => void;
    setGenerating: (v: boolean) => void;
}

/* ================= STORE ================= */

export const useStreamStore = create<StreamState>((set, get) => ({
    typing: false,
    generating: false,
    abort: null,

    setTyping: (v) => set({ typing: v }),
    setGenerating: (v) => set({ generating: v }),

    send: async ({ chatId, model, text }) => {

        const { model: selectedModel, setAutoSelectedModel } =
            useModelStore.getState();

        let finalModel = model;

        // 🧠 AUTO MODE
        if (selectedModel === "auto") {
            finalModel = detectBestModel(text);
            setAutoSelectedModel(finalModel as LocalModel);
        }

        const { addMessage, updateMessage } = useChatStore.getState();

        const assistantId = addMessage(chatId, {
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
                    updateMessage(chatId, assistantId, chunk);
                },
            });
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                updateMessage(
                    chatId,
                    assistantId,
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
