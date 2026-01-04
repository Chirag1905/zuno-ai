import { create } from "zustand";

interface StreamState {
    typing: boolean;
    generating: boolean;
    stop: boolean;

    setTyping: (v: boolean) => void;
    setGenerating: (v: boolean) => void;
    setStop: () => void;
}

export const useStreamStore = create<StreamState>((set) => ({
    typing: false,
    generating: false,
    stop: false,

    setTyping: (v) => set({ typing: v }),
    setGenerating: (v) => set({ generating: v }),
    setStop: () =>
        set({ typing: false, generating: false, stop: true }),
}));
