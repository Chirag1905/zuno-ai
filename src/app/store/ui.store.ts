import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "premium" | "glass" | "neon" | "apple";

interface UIState {
    theme: Theme;
    sidebarOpen: boolean;
    setTheme: (t: Theme) => void;
    toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            theme: "premium",
            sidebarOpen: true,
            setTheme: (t) => set({ theme: t }),
            toggleSidebar: () =>
                set((s) => ({ sidebarOpen: !s.sidebarOpen })),
        }),
        { name: "zuno-ui" }
    )
);
