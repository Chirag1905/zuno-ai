
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-hot-toast";

import { IconButton } from "@/components/ui/Icon";
import { SidebarBrand } from "@/components/ui/SidebarBrand";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SidebarSkeleton from "@/components/ui/SidebarSkeleton";

import { useChatStore, useUIStore } from "@/store";
import api from "@/lib/axios";

import type { User } from "@/types/user";

type MenuPosition = {
    x: number;
    y: number;
};

export default function Sidebar() {
    /* ------------------------------ Stores ------------------------------ */
    const {
        chatSessions,
        activeChatId,
        createNewChat,
        updateChatTitle,
        deleteChatSession,
    } = useChatStore();

    const router = useRouter();
    const { sidebarOpen, toggleSidebar } = useUIStore();

    /* ------------------------------ User State --------------------------- */
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    /* ------------------------------ Delete Dialog ------------------------ */
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    /* ------------------------------ Context Menus ------------------------ */
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);

    const [footerMenuOpen, setFooterMenuOpen] = useState<boolean>(false);
    const [footerMenuPos, setFooterMenuPos] = useState<MenuPosition | null>(null);

    /* ------------------------------ Rename Chat -------------------------- */
    const [editingChatId, setEditingChatId] = useState<string | null>(null);
    const [titleDraft, setTitleDraft] = useState<string>("");
    const [updatingTitle, setUpdatingTitle] = useState<boolean>(false);

    /* ------------------------------ Auth -------------------------------- */
    const handleSignOut = useCallback(async () => {
        await toast.promise(
            api.post("/auth/logout"),
            {
                loading: "Logging out...",
                success: "Logged out successfully",
                error: "Failed to logout",
            },
            { duration: 5000 }
        );

        router.push("/signin");
    }, [router]);

    /* ------------------------------ Fetch Session ------------------------ */
    useEffect(() => {
        api.get("/auth/session")
            .then((res) => setUser(res.data.data.user))
            .catch(() => router.push("/signin"))
            .finally(() => setLoading(false));
    }, [router]);

    /* ------------------------------ Close Menus on Outside Click --------- */
    useEffect(() => {
        const close = () => {
            setOpenMenuId(null);
            setFooterMenuOpen(false);
        };
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    /* ------------------------------ Delete Chat -------------------------- */
    const handleDeleteChat = async (chatId: string | null) => {
        if (!chatId) return;

        setDeleting(true);
        try {
            await toast.promise(
                Promise.resolve(deleteChatSession(chatId)),
                {
                    loading: "Deleting chat...",
                    success: "Chat deleted successfully",
                    error: "Failed to delete chat",
                }
            );
        } finally {
            setDeleting(false);
            setConfirmOpen(false);
            setChatToDelete(null);
        }
    };

    /* ------------------------------ Update Title ------------------------- */
    const handleUpdateTitle = async () => {
        if (!editingChatId || !titleDraft.trim()) return;

        setUpdatingTitle(true);
        try {
            await toast.promise(
                Promise.resolve(updateChatTitle(editingChatId, titleDraft.trim())),
                {
                    loading: "Updating title...",
                    success: "Title updated",
                    error: "Failed to update title",
                }
            );
        } finally {
            setUpdatingTitle(false);
            setEditingChatId(null);
            setTitleDraft("");
        }
    };

    /* ------------------------------ Loading States ----------------------- */
    // if (loading) return <SidebarSkeleton />;
    if (!user) return null;

    /* ------------------------------ UI ----------------------------------- */
    return (
        <>
            {/* SIDEBAR */}
            <aside
                className={`fixed top-5 bottom-5 z-40 w-80 transition-all duration-500 ease-in-out
                        ${sidebarOpen
                        ? "translate-x-0 opacity-100"
                        : "-translate-x-full opacity-0 pointer-events-none"
                    }
                        `}
            >
                <div className="h-full flex flex-col rounded-4xl bg-linear-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
                    {/* HEADER */}
                    <div className="px-5 py-4 flex justify-between items-center border-b border-white/10">
                        <SidebarBrand />
                        <IconButton
                            icon="PanelRightOpen"
                            size="lg"
                            variant="ghost"
                            onClick={toggleSidebar}
                        />
                    </div>

                    {/* NEW CHAT */}
                    <div className="px-3 py-4">
                        <IconButton
                            icon="MessageCirclePlus"
                            text="New Chat"
                            size="md"
                            className="w-full justify-center py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl shadow-md hover:shadow-blue-500/40"
                            onClick={createNewChat}
                        />
                    </div>

                    {/* CHAT LIST */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 no-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {chatSessions?.map((chat) => (
                                <motion.div
                                    key={chat.id}
                                    layout
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{
                                        opacity: 0,
                                        x: -40,
                                        scale: 0.95,
                                        transition: { duration: 0.18 },
                                    }}
                                    onClick={() => {
                                        router.push(`/c/${chat.id}`);
                                    }}
                                    className={`group flex items-center justify-between px-3 py-2 rounded-2xl cursor-pointer transition-all
                ${chat.id === activeChatId
                                            ? "bg-blue-600/20 text-blue-300 font-bold"
                                            : "hover:bg-white/5"
                                        }`}
                                >
                                    {editingChatId === chat.id ? (
                                        <input
                                            autoFocus
                                            value={titleDraft}
                                            disabled={updatingTitle}
                                            onChange={(e) => setTitleDraft(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleUpdateTitle();
                                                if (e.key === "Escape") setEditingChatId(null);
                                            }}
                                            className="flex-1 bg-transparent border-b border-blue-500 outline-none text-sm"
                                        />
                                    ) : (
                                        <span className="truncate text-sm flex-1">
                                            {chat.title}
                                        </span>
                                    )}

                                    <div className="opacity-0 group-hover:opacity-100 transition">
                                        <IconButton
                                            icon="MoreVertical"
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setMenuPos({ x: rect.right + 2, y: rect.top });
                                                setOpenMenuId(chat.id);
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                    </div>

                    {/* FOOTER */}
                    <div className="px-5 py-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-400">
                        <span className="truncate">{user.name ?? "User"}</span>

                        <IconButton
                            icon="MoreVertical"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();

                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                setFooterMenuPos({
                                    x: rect.right,
                                    y: rect.top,
                                });

                                setFooterMenuOpen((prev) => !prev);
                            }}
                        />
                    </div>
                </div>
            </aside>

            {/* CHAT MENU */}
            {openMenuId && menuPos && (
                <div
                    className="fixed z-9999"
                    style={{ top: menuPos.y, left: menuPos.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="min-w-25 p-1 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-[scaleIn_0.12s_ease-out]">
                        <IconButton
                            icon="Edit2"
                            size="sm"
                            rounded="lg"
                            variant="ghost"
                            text="Edit"
                            onClick={() => {
                                const chat = chatSessions.find((c) => c.id === openMenuId);
                                if (!chat) return;

                                setEditingChatId(chat.id);
                                setTitleDraft(chat.title);
                                setOpenMenuId(null);
                            }}
                        />

                        {/* Divider */}
                        <div className="my-1 h-px bg-white/10" />

                        <IconButton
                            icon="Trash"
                            size="sm"
                            rounded="lg"
                            variant="ghost"
                            text="Delete"
                            onClick={() => {
                                setChatToDelete(openMenuId);
                                setConfirmOpen(true);
                                setOpenMenuId(null);
                            }}
                        />
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Delete chat?"
                description="This chat and all its messages will be permanently deleted."
                confirmText="Delete"
                cancelText="Cancel"
                onCancel={() => {
                    setConfirmOpen(false);
                    setChatToDelete(null);
                }}
                onConfirm={() => handleDeleteChat(chatToDelete)}
                loading={deleting}
            />

            {/* FOOTER MENU */}
            {footerMenuOpen && footerMenuPos && (
                <div
                    className="fixed z-9999"
                    style={{ top: footerMenuPos.y, left: footerMenuPos.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="min-w-25 p-1 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-[scaleIn_0.12s_ease-out]">
                        <IconButton
                            icon="LogOut"
                            size="sm"
                            rounded="lg"
                            variant="optional"
                            text="Logout"
                            className="text-red-400 hover:text-red-300"
                            onClick={handleSignOut}
                        />
                    </div>
                </div>
            )}
        </>
    );
}