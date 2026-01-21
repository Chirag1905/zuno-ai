import { create } from "zustand";

interface LLMState {
    online: boolean;
    setOnline: (v: boolean) => void;
}

export const useLLMStore = create<LLMState>((set) => ({
    online: false,
    setOnline: (online) => set({ online }),
}));
