import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ================= TYPES ================= */

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string;
  input: string;

  setInput: (v: string) => void;

  addMessage: (msg: Omit<Message, "id">) => string;
  updateMessage: (id: string, text: string) => void;

  newSession: () => void;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
}

/* ================= HELPERS ================= */

const createSession = (): ChatSession => ({
  id: crypto.randomUUID(),
  title: "New Chat",
  messages: [],
  createdAt: Date.now(),
});

/* ================= STORE ================= */

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => {
      const initial = createSession();

      return {
        sessions: [initial],
        activeSessionId: initial.id,
        input: "",

        setInput: (v) => set({ input: v }),

        addMessage: (msg) => {
          const id = crypto.randomUUID();

          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId
                ? {
                  ...s,
                  messages: [...s.messages, { ...msg, id }],
                  title:
                    s.messages.length === 0 && msg.isUser
                      ? msg.text.slice(0, 40)
                      : s.title,
                }
                : s
            ),
          }));

          return id;
        },

        updateMessage: (id, text) =>
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === state.activeSessionId
                ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === id ? { ...m, text } : m
                  ),
                }
                : s
            ),
          })),

        newSession: () =>
          set((state) => {
            const s = createSession();
            return {
              sessions: [s, ...state.sessions],
              activeSessionId: s.id,
              input: "",
            };
          }),

        switchSession: (id) =>
          set({ activeSessionId: id, input: "" }),

        deleteSession: (id) =>
          set((state) => {
            const remaining = state.sessions.filter((s) => s.id !== id);
            const fallback = remaining[0] ?? createSession();
            return {
              sessions: remaining.length ? remaining : [fallback],
              activeSessionId: fallback.id,
            };
          }),
      };
    },
    { name: "zuno-chat-v4" }
  )
);
