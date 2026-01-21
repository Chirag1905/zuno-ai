import { create } from "zustand";

export type LocalModel =
    | "auto"
    | "llama"
    | "mistral"
    | "qwen"
    | "deepseek";

interface ModelState {
    model: LocalModel;
    autoSelectedModel: LocalModel | null;
    setModel: (m: LocalModel) => void;
    setAutoSelectedModel: (m: LocalModel) => void;
}

export const useModelStore = create<ModelState>((set) => ({
    model: "auto",
    autoSelectedModel: null,

    setModel: (model) =>
        set({
            model,
            autoSelectedModel: null, // manual override disables auto
        }),

    setAutoSelectedModel: (m) =>
        set({
            autoSelectedModel: m,
        }),
}));


// import { create } from "zustand";
// interface ModelState {
//     model: LocalModel;
//     setModel: (m: LocalModel) => void;
// }

// export type LocalModel =
//     | "llama"
//     | "mistral"
//     | "qwen"
//     | "deepseek";

// export const useModelStore = create<ModelState>((set) => ({
//     model: "llama",
//     setModel: (model) => set({ model }),
// }));
