import { create } from "zustand";
import axios from "axios";

/* ================= TYPES ================= */

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
}

interface ChatStore {
  chatSessions: ChatSession[];
  activeChatId: string | null;

  messagesByChat: Record<string, ChatMessage[]>;
  input: string;

  /* ---------- UI ---------- */
  setInput: (value: string) => void;

  /* ---------- Messages ---------- */
  addMessage: (
    chatId: string,
    message: Omit<ChatMessage, "id">
  ) => string;

  updateMessage: (
    chatId: string,
    messageId: string,
    text: string
  ) => void;

  getMessagesForActiveChat: () => ChatMessage[];

  /* ---------- Chats ---------- */
  loadChatSessions: () => Promise<void>;
  loadChatMessages: (chatId: string) => Promise<void>;
  ensureChatSession: () => Promise<string>;
  createNewChat: () => Promise<void>;
  switchChat: (chatId: string) => Promise<void>;
}

/* ================= STORE ================= */

export const useChatStore = create<ChatStore>((set, get) => ({
  chatSessions: [],
  activeChatId: null,
  messagesByChat: {},
  input: "",

  /* ---------- UI ---------- */

  setInput: (value) => set({ input: value }),

  /* ---------- Messages ---------- */

  addMessage: (chatId, message) => {
    const id = crypto.randomUUID();

    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: [
          ...(state.messagesByChat[chatId] ?? []),
          { id, ...message },
        ],
      },
    }));

    return id;
  },

  updateMessage: (chatId, messageId, text) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: (state.messagesByChat[chatId] ?? []).map((m) =>
          m.id === messageId ? { ...m, text } : m
        ),
      },
    })),

  /* ✅ STABLE SELECTOR (IMPORTANT) */
  getMessagesForActiveChat: () => {
    const { activeChatId, messagesByChat } = get();
    return activeChatId ? messagesByChat[activeChatId] ?? [] : [];
  },

  /* ---------- Chats ---------- */

  loadChatSessions: async () => {
    const { data } = await axios.get("/api/c");

    if (data.length === 0) {
      const res = await axios.post("/api/c");
      set({
        chatSessions: [res.data],
        activeChatId: res.data.id,
      });
      return;
    }

    set({
      chatSessions: data,
      activeChatId: data[0].id,
    });
  },

  loadChatMessages: async (chatId) => {
    const { data } = await axios.get(`/api/c/${chatId}`);

    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: data.messages.map((m: any) => ({
          id: m.id,
          text: m.content,
          isUser: m.role === "USER",
        })),
      },
    }));
  },

  ensureChatSession: async () => {
    const { activeChatId } = get();
    if (activeChatId) return activeChatId;

    const { data } = await axios.post("/api/c");

    set((state) => ({
      chatSessions: [data, ...state.chatSessions],
      activeChatId: data.id,
    }));

    return data.id;
  },

  createNewChat: async () => {
    const { data } = await axios.post("/api/c");

    set((state) => ({
      chatSessions: [data, ...state.chatSessions],
      activeChatId: data.id,
      input: "",
    }));
  },

  switchChat: async (chatId) => {
    set({ activeChatId: chatId, input: "" });
    await get().loadChatMessages(chatId);
  },
}));

// import { create } from "zustand";
// import axios from "axios";

// /* ================= TYPES ================= */

// export interface ChatMessage {
//   id: string;
//   text: string;
//   isUser: boolean;
// }

// export interface ChatSession {
//   id: string;
//   title: string;
// }


// interface ChatStore {
//   chatSessions: ChatSession[];
//   activeChatId: string | null;

//   messagesByChat: Record<string, ChatMessage[]>;
//   input: string;

//   setInput: (value: string) => void;

//   addMessage: (
//     chatId: string,
//     message: Omit<ChatMessage, "id">
//   ) => string;

//   updateMessage: (
//     chatId: string,
//     messageId: string,
//     text: string
//   ) => void;

//   loadChatSessions: () => Promise<void>;
//   loadChatMessages: (chatId: string) => Promise<void>;
//   ensureChatSession: () => Promise<string>;
//   createNewChat: () => Promise<void>;
//   switchChat: (chatId: string) => Promise<void>;
// }

// /* ================= STORE ================= */

// export const useChatStore = create<ChatStore>((set, get) => ({
//   chatSessions: [],
//   activeChatId: null,
//   messagesByChat: {},
//   input: "",

//   setInput: (value) => set({ input: value }),

//   /* ---------- Messages ---------- */

//   addMessage: (chatId, message) => {
//     const id = crypto.randomUUID();

//     set((state) => ({
//       messagesByChat: {
//         ...state.messagesByChat,
//         [chatId]: [
//           ...(state.messagesByChat[chatId] ?? []),
//           { id, ...message },
//         ],
//       },
//     }));

//     return id;
//   },

//   updateMessage: (chatId, messageId, text) =>
//     set((state) => ({
//       messagesByChat: {
//         ...state.messagesByChat,
//         [chatId]: (state.messagesByChat[chatId] ?? []).map((m) =>
//           m.id === messageId ? { ...m, text } : m
//         ),
//       },
//     })),

//   /* ---------- Chats ---------- */

//   loadChatSessions: async () => {
//     const { data } = await axios.get("/api/c");

//     if (data.length === 0) {
//       const res = await axios.post("/api/c");
//       set({
//         chatSessions: [res.data],
//         activeChatId: res.data.id,
//       });
//       return;
//     }

//     set({
//       chatSessions: data,
//       activeChatId: data[0].id,
//     });
//   },

//   loadChatMessages: async (chatId) => {
//     const { data } = await axios.get(`/api/c/${chatId}`);

//     set((state) => ({
//       messagesByChat: {
//         ...state.messagesByChat,
//         [chatId]: data.messages.map((m: any) => ({
//           id: m.id,
//           text: m.content,
//           isUser: m.role === "USER",
//         })),
//       },
//     }));
//   },

//   ensureChatSession: async () => {
//     const { activeChatId } = get();
//     if (activeChatId) return activeChatId;

//     const { data } = await axios.post("/api/c");

//     set((state) => ({
//       chatSessions: [data, ...state.chatSessions],
//       activeChatId: data.id,
//     }));

//     return data.id;
//   },

//   createNewChat: async () => {
//     const { data } = await axios.post("/api/c");

//     set((state) => ({
//       chatSessions: [data, ...state.chatSessions],
//       activeChatId: data.id,
//       input: "",
//     }));
//   },

//   switchChat: async (chatId) => {
//     set({ activeChatId: chatId, input: "" });
//     await get().loadChatMessages(chatId);
//   },
// }));

// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// /* ================= TYPES ================= */

// export interface Message {
//   id: string;
//   text: string;
//   isUser: boolean;
// }

// export interface ChatSession {
//   id: string;
//   title: string;
//   messages: Message[];
//   createdAt: number;
// }

// interface ChatState {
//   sessions: ChatSession[];
//   activeSessionId: string;
//   input: string;

//   setInput: (v: string) => void;

//   addMessage: (msg: Omit<Message, "id">) => string;
//   updateMessage: (id: string, text: string) => void;

//   newSession: () => void;
//   switchSession: (id: string) => void;
//   deleteSession: (id: string) => void;
// }

// /* ================= HELPERS ================= */

// const createSession = (): ChatSession => ({
//   id: crypto.randomUUID(),
//   title: "New Chat",
//   messages: [],
//   createdAt: Date.now(),
// });

// /* ================= STORE ================= */

// export const useChatStore = create<ChatState>()(
//   persist(
//     (set, get) => {
//       const initial = createSession();

//       return {
//         sessions: [initial],
//         activeSessionId: initial.id,
//         input: "",

//         setInput: (v) => set({ input: v }),

//         addMessage: (msg) => {
//           const id = crypto.randomUUID();

//           set((state) => ({
//             sessions: state.sessions.map((s) =>
//               s.id === state.activeSessionId
//                 ? {
//                   ...s,
//                   messages: [...s.messages, { ...msg, id }],
//                   title:
//                     s.messages.length === 0 && msg.isUser
//                       ? msg.text.slice(0, 40)
//                       : s.title,
//                 }
//                 : s
//             ),
//           }));

//           return id;
//         },

//         updateMessage: (id, text) =>
//           set((state) => ({
//             sessions: state.sessions.map((s) =>
//               s.id === state.activeSessionId
//                 ? {
//                   ...s,
//                   messages: s.messages.map((m) =>
//                     m.id === id ? { ...m, text } : m
//                   ),
//                 }
//                 : s
//             ),
//           })),

//         newSession: () =>
//           set((state) => {
//             const s = createSession();
//             return {
//               sessions: [s, ...state.sessions],
//               activeSessionId: s.id,
//               input: "",
//             };
//           }),

//         switchSession: (id) =>
//           set({ activeSessionId: id, input: "" }),

//         deleteSession: (id) =>
//           set((state) => {
//             const remaining = state.sessions.filter((s) => s.id !== id);
//             const fallback = remaining[0] ?? createSession();
//             return {
//               sessions: remaining.length ? remaining : [fallback],
//               activeSessionId: fallback.id,
//             };
//           }),
//       };
//     },
//     { name: "zuno-chat-v4" }
//   )
// );
