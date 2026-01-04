import { create } from "zustand";

export type LocalModel =
    | "llama3.1"
    | "mistral"
    | "qwen"
    | "deepseek";

interface ModelState {
    model: LocalModel;
    setModel: (m: LocalModel) => void;
}

export const useModelStore = create<ModelState>((set) => ({
    model: "llama3.1",
    setModel: (model) => set({ model }),
}));
