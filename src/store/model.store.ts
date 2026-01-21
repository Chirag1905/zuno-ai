import { create } from "zustand";
interface ModelState {
    model: LocalModel;
    setModel: (m: LocalModel) => void;
}

export type LocalModel =
    | "llama"
    | "mistral"
    | "qwen"
    | "deepseek";

export const useModelStore = create<ModelState>((set) => ({
    model: "llama",
    setModel: (model) => set({ model }),
}));
