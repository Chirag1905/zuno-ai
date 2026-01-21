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

interface ApiMessage {
  id: string;
  content: string;
  role: "USER" | "ASSISTANT";
}

interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  error: unknown;
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
  createNewChat: () => Promise<string>;
  switchChat: (chatId: string) => Promise<void>;

  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  deleteChatSession: (chatId: string) => Promise<void>;
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
    const res = await axios.get<ApiResponse<ChatSession[]>>("/api/c");
    console.log("🚀 ~ loadChatSessions:")
    const chats = res.data.data;

    if (!chats || chats.length === 0) {
      const createRes = await axios.post<ApiResponse<ChatSession>>("/api/c");

      set({
        chatSessions: [createRes.data.data],
        activeChatId: createRes.data.data.id,
      });
      return;
    }

    set({
      chatSessions: chats,
      activeChatId: chats[0].id,
    });
  },


  loadChatMessages: async (chatId) => {
    const res = await axios.get<
      ApiResponse<{ messages: ApiMessage[] }>
    >(`/api/c/${chatId}`);

    const messages = res.data.data.messages;

    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: messages.map((m) => ({
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

    const res = await axios.post<ApiResponse<ChatSession>>("/api/c");
    const chat = res.data.data;

    set((state) => ({
      chatSessions: [chat, ...state.chatSessions],
      activeChatId: chat.id,
    }));

    return chat.id;
  },

  createNewChat: async () => {
    const res = await axios.post<ApiResponse<ChatSession>>("/api/c");
    const chat = res.data.data;

    set((state) => ({
      chatSessions: [chat, ...state.chatSessions],
      activeChatId: chat.id,
      input: "",
    }));

    return chat.id;
  },


  switchChat: async (chatId) => {
    set({ activeChatId: chatId, input: "" });
    await get().loadChatMessages(chatId);
  },

  /* ---------- Edit Chat ---------- */
  updateChatTitle: async (chatId, title) => {
    const res = await axios.patch<ApiResponse<ChatSession>>(
      `/api/c/${chatId}`,
      { title }
    );

    const updatedChat = res.data.data;

    set((state) => ({
      chatSessions: state.chatSessions.map((c) =>
        c.id === chatId ? updatedChat : c
      ),
    }));
  },

  /* ---------- Delete Chat ---------- */
  deleteChatSession: async (chatId) => {
    await axios.delete<ApiResponse<null>>(`/api/c/${chatId}`);

    let nextActiveChatId: string | null = null;

    set((state) => {
      const index = state.chatSessions.findIndex((c) => c.id === chatId);

      const remainingChats = state.chatSessions.filter(
        (c) => c.id !== chatId
      );

      let newActiveChatId = state.activeChatId;

      // ✅ If deleted chat was active → select next or previous
      if (state.activeChatId === chatId) {
        newActiveChatId =
          remainingChats[index]?.id ||       // next chat
          remainingChats[index - 1]?.id ||   // previous chat
          null;
      }

      nextActiveChatId = newActiveChatId;

      return {
        chatSessions: remainingChats,
        activeChatId: newActiveChatId,
        messagesByChat: Object.fromEntries(
          Object.entries(state.messagesByChat).filter(
            ([key]) => key !== chatId
          )
        ),
      };
    });

    // ✅ Ensure user is never stuck without a chat
    if (!nextActiveChatId) {
      await get().createNewChat();
    }
  },

}));