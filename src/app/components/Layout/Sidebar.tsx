"use client";

import { useChatStore, useUIStore } from "@/app/store";
import { SidebarBrand } from "../ui/sidebarBrand";
import { IconButton } from "../ui/Icon";
import { useEffect, useState } from "react";

export default function Sidebar() {
    const {
        sessions,
        activeSessionId,
        switchSession,
        deleteSession,
        newSession,
    } = useChatStore();

    const { sidebarOpen, toggleSidebar } = useUIStore();

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

    // Close menu on outside click
    useEffect(() => {
        const close = () => setOpenMenuId(null);
        window.addEventListener("click", close);
        return () => window.removeEventListener("click", close);
    }, []);

    return (
        <>
            {/* SIDEBAR */}
            <aside
                className={`fixed left-5 top-5 bottom-5 z-40 w-80 transition-all duration-500 ease-in-out
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
                            withText
                            size="md"
                            className="w-full justify-center py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl shadow-md hover:shadow-blue-500/40"
                            onClick={newSession}
                        />
                    </div>

                    {/* CHAT LIST */}
                    <div className="flex-1 overflow-y-auto px-3 pb-3 no-scrollbar">
                        {sessions.map((s) => {
                            const active = s.id === activeSessionId;

                            return (
                                <div
                                    key={s.id}
                                    onClick={() => switchSession(s.id)}
                                    className={`group flex items-center justify-between px-3 py-2 rounded-2xl cursor-pointer transition-all
                                            ${active
                                            ? "bg-blue-600/20 text-blue-300 font-bold"
                                            : "hover:bg-white/5"
                                        }
                                            `}
                                >
                                    <span className="truncate text-sm flex-1">{s.title}</span>

                                    {/* MORE BUTTON */}
                                    <div className="opacity-0 group-hover:opacity-100 transition">
                                        <IconButton
                                            icon="MoreVertical"
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const rect = (
                                                    e.currentTarget as HTMLElement
                                                ).getBoundingClientRect();

                                                setMenuPos({
                                                    x: rect.right + 2,
                                                    y: rect.top,
                                                });

                                                setOpenMenuId(openMenuId === s.id ? null : s.id);
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* FOOTER */}
                    <div className="px-5 py-4 border-t border-white/10 flex justify-between text-xs text-gray-400">
                        <span>Anonymous</span>
                        <IconButton icon="MoreHorizontal" variant="ghost" />
                    </div>
                </div>
            </aside>

            {/* ANTD-LIKE POPOUT MENU */}
            {openMenuId && menuPos && (
                <div
                    className="fixed z-9999"
                    style={{ top: menuPos.y, left: menuPos.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div
                        className="min-w-25 p-1 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-[scaleIn_0.12s_ease-out]"
                    >
                        <IconButton
                            icon="Edit2"
                            size="sm"
                            variant="ghost"
                            text="Edit"
                            onClick={() => {
                                setOpenMenuId(null);

                                console.log("Edit session");
                            }}
                        />

                        {/* Divider */}
                        <div className="my-1 h-px bg-white/10" />

                        <IconButton
                            icon="Trash"
                            size="sm"
                            variant="ghost"
                            text="Delete"
                            onClick={() => {
                                deleteSession(openMenuId);
                                setOpenMenuId(null);
                                console.log("Delete session");
                            }}
                        />
                    </div>
                </div>
            )}
        </>
    );
}


// "use client";

// import { useChatStore, useUIStore } from "@/app/store";
// import { SidebarBrand } from "../ui/sidebarBrand";
// import { IconButton } from "../ui/Icon";
// import { useEffect, useMemo, useState } from "react";

// export default function Sidebar() {
//   const {
//     sessions,
//     activeSessionId,
//     switchSession,
//     deleteSession,
//     newSession,
//     togglePinSession, // 👉 add this action in store
//   } = useChatStore();

//   const { sidebarOpen, toggleSidebar } = useUIStore();

//   const [search, setSearch] = useState("");
//   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
//   const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

//   useEffect(() => {
//     const close = () => setOpenMenuId(null);
//     window.addEventListener("click", close);
//     return () => window.removeEventListener("click", close);
//   }, []);

//   /* ---------------- FILTERED DATA ---------------- */

//   const filtered = useMemo(() => {
//     return sessions.filter((s) =>
//       s.title.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [sessions, search]);

//   const pinned = filtered.filter((s) => s.pinned);
//   const unpinned = filtered.filter((s) => !s.pinned);

//   /* ---------------- UI ---------------- */

//   return (
//     <>
//       <aside
//         className={`fixed left-5 top-5 bottom-5 z-40 w-80 transition-all duration-500
//           ${sidebarOpen
//             ? "translate-x-0 opacity-100"
//             : "-translate-x-full opacity-0 pointer-events-none"}`}
//       >
//         <div className="h-full flex flex-col rounded-4xl bg-linear-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">

//           {/* HEADER */}
//           <div className="px-5 py-4 flex justify-between items-center border-b border-white/10">
//             <SidebarBrand />
//             <IconButton icon="PanelRightOpen" size="lg" variant="ghost" onClick={toggleSidebar} />
//           </div>

//           {/* SEARCH */}
//           <div className="px-4 pt-3">
//             <div className="relative">
//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search chats"
//                 className="
//                   w-full rounded-xl px-3 py-2 text-sm
//                   bg-white/5 border border-white/10
//                   placeholder:text-gray-400
//                   focus:outline-none focus:ring-2 focus:ring-blue-500/40
//                 "
//               />
//             </div>
//           </div>

//           {/* NEW CHAT */}
//           <div className="px-3 py-4">
//             <IconButton
//               icon="MessageCirclePlus"
//               text="New Chat"
//               withText
//               size="md"
//               className="w-full justify-center py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl shadow-md hover:shadow-blue-500/40"
//               onClick={newSession}
//             />
//           </div>

//           {/* CHAT LIST */}
//           <div className="flex-1 overflow-y-auto px-3 pb-3 no-scrollbar space-y-2">

//             {/* 📌 PINNED */}
//             {pinned.length > 0 && (
//               <>
//                 <div className="px-2 text-xs text-gray-400 uppercase tracking-wide">
//                   Pinned
//                 </div>
//                 {pinned.map(renderChat)}
//               </>
//             )}

//             {/* NORMAL */}
//             {unpinned.length > 0 && (
//               <>
//                 {pinned.length > 0 && (
//                   <div className="px-2 pt-3 text-xs text-gray-400 uppercase tracking-wide">
//                     Chats
//                   </div>
//                 )}
//                 {unpinned.map(renderChat)}
//               </>
//             )}
//           </div>

//           {/* FOOTER */}
//           <div className="px-5 py-4 border-t border-white/10 flex justify-between text-xs text-gray-400">
//             <span>Anonymous</span>
//             <IconButton icon="MoreHorizontal" variant="ghost" />
//           </div>
//         </div>
//       </aside>

//       {/* CONTEXT MENU */}
//       {openMenuId && menuPos && (
//         <div
//           className="fixed z-[9999]"
//           style={{ top: menuPos.y, left: menuPos.x }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="min-w-36 p-1 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)]">

//             <IconButton
//               icon="Pin"
//               size="sm"
//               variant="ghost"
//               text="Pin / Unpin"
//               onClick={() => {
//                 togglePinSession(openMenuId);
//                 setOpenMenuId(null);
//               }}
//             />

//             <div className="my-1 h-px bg-white/10" />

//             <IconButton
//               icon="Trash"
//               size="sm"
//               variant="ghost"
//               text="Delete"
//               onClick={() => {
//                 deleteSession(openMenuId);
//                 setOpenMenuId(null);
//               }}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );

//   /* ---------------- CHAT ITEM ---------------- */

//   function renderChat(s: any) {
//     const active = s.id === activeSessionId;

//     return (
//       <div
//         key={s.id}
//         onClick={() => switchSession(s.id)}
//         className={`group flex items-center justify-between px-3 py-2 rounded-2xl cursor-pointer transition-all
//           ${active
//             ? "bg-blue-600/20 text-blue-300 font-semibold"
//             : "hover:bg-white/5"
//           }`}
//       >
//         <div className="flex items-center gap-2 min-w-0">
//           {s.pinned && <span className="text-xs text-yellow-400">📌</span>}
//           <span className="truncate text-sm">{s.title}</span>
//         </div>

//         <div className="opacity-0 group-hover:opacity-100 transition">
//           <IconButton
//             icon="MoreVertical"
//             size="sm"
//             variant="ghost"
//             onClick={(e) => {
//               e.stopPropagation();
//               const rect = e.currentTarget.getBoundingClientRect();
//               setMenuPos({ x: rect.right + 2, y: rect.top });
//               setOpenMenuId(openMenuId === s.id ? null : s.id);
//             }}
//           />
//         </div>
//       </div>
//     );
//   }
// }
