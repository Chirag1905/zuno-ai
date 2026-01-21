import { create } from "zustand";
import type {
  ChatMessage,
  ChatSession,
  ApiMessage,
} from "@/types/chat";
import { chatService } from "@/services/chat.api";

/* ================= TYPES ================= */

export interface ChatStore {
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
  /* ---------- STATE ---------- */

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

  /** ✅ stable selector (important for performance) */
  getMessagesForActiveChat: () => {
    const { activeChatId, messagesByChat } = get();
    return activeChatId ? messagesByChat[activeChatId] ?? [] : [];
  },

  /* ---------- Chats ---------- */

  loadChatSessions: async () => {
    const res = await chatService.list();
    const chats = res.data.data;

    // 🧠 ensure user always has a chat
    if (!chats || chats.length === 0) {
      const created = await chatService.create();
      set({
        chatSessions: [created.data.data],
        activeChatId: created.data.data.id,
      });
      return;
    }

    set((state) => ({
      chatSessions: chats,
      activeChatId: state.activeChatId ?? chats[0].id,
    }));
  },

  loadChatMessages: async (chatId) => {
    const res = await chatService.messages(chatId);
    const messages = res.data.data.messages;

    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: messages.map((m: ApiMessage) => ({
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

    const res = await chatService.create();
    const chat = res.data.data;

    set((state) => ({
      chatSessions: [chat, ...state.chatSessions],
      activeChatId: chat.id,
    }));

    return chat.id;
  },

  createNewChat: async () => {
    const res = await chatService.create();
    const chat = res.data.data;

    set((state) => ({
      chatSessions: [chat, ...state.chatSessions],
      activeChatId: chat.id,
      input: "",
    }));

    return chat.id;
  },

  switchChat: async (chatId) => {
    const { activeChatId, messagesByChat } = get();

    if (activeChatId === chatId && messagesByChat[chatId]) {
      set({ input: "" });
      return;
    }

    set({ activeChatId: chatId, input: "" });

    if (!messagesByChat[chatId]) {
      await get().loadChatMessages(chatId);
    }
  },

  updateChatTitle: async (chatId, title) => {
    const res = await chatService.updateTitle(chatId, title);
    const updatedChat = res.data.data;

    set((state) => ({
      chatSessions: state.chatSessions.map((c) =>
        c.id === chatId ? updatedChat : c
      ),
    }));
  },

  deleteChatSession: async (chatId) => {
    await chatService.delete(chatId);

    let nextActiveChatId: string | null = null;

    set((state) => {
      const index = state.chatSessions.findIndex(
        (c) => c.id === chatId
      );

      const remainingChats = state.chatSessions.filter(
        (c) => c.id !== chatId
      );

      let newActiveChatId = state.activeChatId;

      // 🧠 if deleted chat was active → choose next or previous
      if (state.activeChatId === chatId) {
        newActiveChatId =
          remainingChats[index]?.id ??
          remainingChats[index - 1]?.id ??
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

    // 🛡 ensure app never ends without a chat
    if (!nextActiveChatId) {
      await get().createNewChat();
    }
  },
}));
