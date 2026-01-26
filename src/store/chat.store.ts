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
  isDraftChat: boolean;

  /* ---------- UI ---------- */
  setInput: (value: string) => void;
  startDraftChat: () => void;

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

  /* ---------- Chats ---------- */
  loadChatSessions: () => Promise<void>;
  loadChatMessages: (chatId: string) => Promise<void>;
  ensureChatSession: () => Promise<string>;
  createNewChat: () => Promise<string>;
  switchChat: (chatId: string) => Promise<void>;

  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  deleteChatSession: (chatId: string) => Promise<void>;
  removeLastAssistantMessage: (chatId: string) => void;
}

const mapApiMessages = (messages: ApiMessage[]) =>
  messages.map((m) => ({
    id: m.id,
    text: m.content,
    isUser: m.role === "USER",
  }));

/* ================= STORE ================= */

export const useChatStore = create<ChatStore>((set, get) => ({
  chatSessions: [],
  activeChatId: null,
  messagesByChat: {},
  input: "",
  isDraftChat: false,

  /* ---------- UI ---------- */
  setInput: (input) => set({ input }),

  startDraftChat: () =>
    set({ activeChatId: null, input: "", isDraftChat: true }),

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
        [chatId]: state.messagesByChat[chatId]?.map((m) =>
          m.id === messageId ? { ...m, text } : m
        ) ?? [],
      },
    })),

  /* ---------- Chats ---------- */
  loadChatSessions: async () => {
    const { data } = await chatService.getChats();
    const chats = data.data;

    set({ chatSessions: chats });
  },

  loadChatMessages: async (chatId) => {
    const { data } = await chatService.getChatMessages(chatId);

    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: mapApiMessages(data.data.messages),
      },
    }));
  },

  ensureChatSession: async () => {
    const { activeChatId, isDraftChat } = get();
    if (activeChatId && !isDraftChat) return activeChatId;

    const { data } = await chatService.createChat();
    const chat = data.data;

    set((state) => ({
      chatSessions: [chat, ...state.chatSessions],
      activeChatId: chat.id,
      isDraftChat: false,
    }));

    return chat.id;
  },

  createNewChat: async () => {
    const { data } = await chatService.createChat();
    const chat = data.data;

    set((state) => ({
      chatSessions: [chat, ...state.chatSessions],
      activeChatId: chat.id,
      input: "",
    }));

    return chat.id;
  },

  switchChat: async (chatId) => {
    const { activeChatId, messagesByChat } = get();

    if (activeChatId === chatId) {
      set({ input: "" });
      return;
    }

    set({ activeChatId: chatId, input: "" });

    if (!messagesByChat[chatId]) {
      await get().loadChatMessages(chatId);
    }
  },

  updateChatTitle: async (chatId, title) => {
    const { data } = await chatService.updateChatTitle(chatId, title);
    const updated = data.data;

    set((state) => ({
      chatSessions: state.chatSessions.map((c) =>
        c.id === chatId ? updated : c
      ),
    }));
  },

  deleteChatSession: async (chatId) => {
    await chatService.deleteChat(chatId);

    let nextId: string | null = null;

    set((state) => {
      const index = state.chatSessions.findIndex((c) => c.id === chatId);
      const remaining = state.chatSessions.filter((c) => c.id !== chatId);

      if (state.activeChatId === chatId) {
        nextId =
          remaining[index]?.id ??
          remaining[index - 1]?.id ??
          null;
      }

      return {
        chatSessions: remaining,
        activeChatId: nextId,
        messagesByChat: Object.fromEntries(
          Object.entries(state.messagesByChat).filter(([id]) => id !== chatId)
        ),
      };
    });

    if (!nextId) await get().createNewChat();
  },

  removeLastAssistantMessage: (chatId) =>
    set((state) => {
      const messages = state.messagesByChat[chatId] ?? [];
      if (!messages.length) return state;

      const last = messages[messages.length - 1];
      if (last.isUser) return state;

      return {
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: messages.slice(0, -1),
        },
      };
    }),
}));
