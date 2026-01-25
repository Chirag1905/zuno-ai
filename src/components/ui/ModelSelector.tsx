"use client";

import * as Popover from "@radix-ui/react-popover";
import { useMemo, useState } from "react";
import { useModelStore, useChatStore } from "@/store";
import type { LocalModel } from "@/store";
import { IconButton } from "@/components/ui/Icon";

const MODELS: LocalModel[] = [
    "llama",
    "mistral",
    "qwen",
    "deepseek",
];

export default function ModelSelector() {
    const { model, autoSelectedModel, setModel } = useModelStore();

    const activeChatId = useChatStore((s) => s.activeChatId);
    const messagesByChat = useChatStore((s) => s.messagesByChat);

    const hasMessages = useMemo(() => {
        if (!activeChatId) return false;
        return (messagesByChat[activeChatId]?.length ?? 0) > 0;
    }, [activeChatId, messagesByChat]);

    const [open, setOpen] = useState(false);

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            {/* Trigger */}
            <Popover.Trigger asChild>
                <IconButton
                    variant="optional"
                    size="sm"
                    rounded="full"
                    text={
                        model === "auto"
                            ? `AUTO • ${autoSelectedModel ?? "llama"}`
                            : model
                    }
                    textClassName={
                        model === "auto"
                            ? "uppercase tracking-wide text-sm font-bold text-blue-400"
                            : "uppercase tracking-wide text-sm font-bold"
                    }

                    iconClassName={open ? "rotate-180 text-blue-400 transition-transform" : "text-blue-400 transition-transform"}
                    icon={open ? "ChevronUp" : "ChevronDown"}
                    iconPosition="right"
                    className="
                        px-4
                        bg-white/5
                        backdrop-blur-xl
                        border border-white/10
                        shadow-[0_0_30px_rgba(0,0,0,0.45)]
                        hover:bg-white/15
                    "
                />
            </Popover.Trigger>

            {/* Content */}
            <Popover.Portal>
                <Popover.Content
                    autoFocus
                    side={hasMessages ? "top" : "bottom"}
                    align="end"
                    sideOffset={8}
                    className="
                        w-32
                        rounded-2xl
                        bg-[#0b0b14]/80!
                        backdrop-blur-2xl
                        border border-white/10
                        shadow-[0_20px_50px_rgba(0,0,0,0.6)]
                        overflow-hidden
                        z-50
                    "
                >
                    {MODELS.map((m) => {
                        const active = model === m;

                        return (
                            <IconButton
                                key={m}
                                onClick={() => {
                                    setModel(m);
                                    setOpen(false); // ✅ CLOSE DROPDOWN
                                }}
                                text={m}
                                icon={active ? "Check" : undefined}
                                iconPosition="right"
                                size="sm"
                                rounded="none"
                                variant="optional"
                                textClassName="uppercase tracking-wide"
                                iconClassName="text-blue-400"
                                className={`
                                    w-full justify-between px-4 py-2
                                    ${active
                                        ? "bg-white/10 text-white"
                                        : "text-white/70 hover:bg-white/10"
                                    }
                                `}
                            />
                        );
                    })}
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}

// "use client";

// import { useState, useRef, useEffect, useMemo } from "react";
// import { useModelStore, useChatStore } from "@/store";
// import type { LocalModel } from "@/store";
// import { IconButton } from "@/components/ui/Icon";

// const MODELS: LocalModel[] = [
//     "llama",
//     "mistral",
//     "qwen",
//     "deepseek",
// ];

// export default function ModelSelector() {
//     const { model, setModel } = useModelStore();

//     const activeChatId = useChatStore((s) => s.activeChatId);
//     const messagesByChat = useChatStore((s) => s.messagesByChat);

//     const messages = useMemo(() => {
//         if (!activeChatId) return [];
//         return messagesByChat[activeChatId] ?? [];
//     }, [activeChatId, messagesByChat]);

//     const hasMessages = messages.length > 0;

//     const [open, setOpen] = useState(false);
//     const buttonRef = useRef<HTMLDivElement>(null);
//     const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

//     /* ---------- measure button ---------- */
//     useEffect(() => {
//         if (!open || !buttonRef.current) return;

//         const rect = buttonRef.current.getBoundingClientRect();

//         setPos({
//             left: rect.right - 128, // dropdown width
//             top: hasMessages
//                 ? rect.top - 8       // open UP
//                 : rect.bottom + 8,   // open DOWN
//         });
//     }, [open, hasMessages]);

//     /* ---------- outside click ---------- */
//     useEffect(() => {
//         const handler = (e: MouseEvent) => {
//             if (!buttonRef.current?.contains(e.target as Node)) {
//                 setOpen(false);
//             }
//         };
//         window.addEventListener("mousedown", handler);
//         return () => window.removeEventListener("mousedown", handler);
//     }, []);

//     return (
//         <>
//             {/* Trigger */}
//             <div ref={buttonRef}>
//                 <IconButton
//                     onClick={() => setOpen((v) => !v)}
//                     variant="optional"
//                     rounded="full"
//                     text={model}
//                     textClassName="uppercase tracking-wide text-sm"
//                     icon="ChevronDown"
//                     iconPosition="right"
//                     iconClassName={`text-white/60 transition-transform ${open ? "rotate-180" : ""}`}
//                     className="
//                         px-4 py-2
//                         bg-white/10
//                         backdrop-blur-xl
//                         border border-white/10
//                         shadow-[0_0_30px_rgba(0,0,0,0.45)]
//                         hover:bg-white/15
//                     "
//                 />
//             </div>

//             {/* Dropdown (FIXED POSITION) */}
//             {open && (
//                 <div
//                     style={{
//                         position: "fixed",
//                         left: pos.left,
//                         top: hasMessages ? pos.top - 160 : pos.top, // menu height
//                     }}
//                     className="
//                         w-32
//                         rounded-2xl
//                         bg-[#0b0b14]/80
//                         backdrop-blur-2xl
//                         border border-white/15
//                         shadow-[0_20px_50px_rgba(0,0,0,0.6)]
//                         overflow-hidden
//                         z-9999
//                     "
//                 >
//                     {MODELS.map((m) => {
//                         const active = model === m;

//                         return (
//                             <IconButton
//                                 key={m}
//                                 onClick={() => {
//                                     setModel(m);
//                                     setOpen(false);
//                                 }}
//                                 text={m}
//                                 icon={active ? "Check" : undefined}
//                                 iconPosition="right"
//                                 size="sm"
//                                 rounded="none"
//                                 variant="optional"
//                                 textClassName="uppercase tracking-wide"
//                                 iconClassName="text-blue-400"
//                                 className={`
//                                     w-full justify-between px-4 py-2.5
//                                     ${active
//                                         ? "bg-white/10 text-white"
//                                         : "text-white/70 hover:bg-white/10"
//                                     }
//                                 `}
//                             />
//                         );
//                     })}
//                 </div>
//             )}
//         </>
//     );
// }

// "use client";

// import { useState, useRef, useEffect, useMemo } from "react";
// import { useModelStore, useChatStore } from "@/store";
// import type { LocalModel } from "@/store";
// import { IconButton } from "@/components/ui/Icon";

// const MODELS: LocalModel[] = [
//     "llama",
//     "mistral",
//     "qwen",
//     "deepseek",
// ];

// export default function ModelSelector() {
//     const { model, setModel } = useModelStore();

//     const activeChatId = useChatStore((s) => s.activeChatId);
//     const messagesByChat = useChatStore((s) => s.messagesByChat);

//     // ✅ memoized & stable
//     const messages = useMemo(() => {
//         if (!activeChatId) return [];
//         return messagesByChat[activeChatId] ?? [];
//     }, [activeChatId, messagesByChat]);

//     const hasMessages = messages.length > 0;

//     const [open, setOpen] = useState(false);
//     const ref = useRef<HTMLDivElement>(null);

//     /* ---------------- Close on outside click ---------------- */
//     useEffect(() => {
//         const handler = (e: MouseEvent) => {
//             if (!ref.current?.contains(e.target as Node)) {
//                 setOpen(false);
//             }
//         };
//         window.addEventListener("mousedown", handler);
//         return () => window.removeEventListener("mousedown", handler);
//     }, []);

//     return (
//         <div ref={ref} className="relative">
//             {/* Trigger */}
//             <IconButton
//                 onClick={() => setOpen((v) => !v)}
//                 variant="optional"
//                 rounded="full"
//                 text={model}
//                 textClassName="uppercase tracking-wide text-sm"
//                 icon="ChevronDown"
//                 iconPosition="right"
//                 iconClassName={`text-white/60 transition-transform ${open ? "rotate-180" : ""}`}
//                 className="
//                     px-4 py-2
//                     bg-white/10
//                     backdrop-blur-xl
//                     border border-white/10
//                     shadow-[0_0_30px_rgba(0,0,0,0.45)]
//                     hover:bg-white/15
//                 "
//             />

//             {/* Dropdown */}
//             {open && (
//                 <div
//                     className={`
//             absolute right-0 w-32
//             rounded-2xl
//             bg-[#0b0b14]/80
//             backdrop-blur-2xl
//             border border-white/15
//             shadow-[0_20px_50px_rgba(0,0,0,0.6)]
//             overflow-hidden
//             z-50
//             transition-all
//             ${hasMessages
//                             ? "top-auto bottom-full mb-2"
//                             : "bottom-auto top-full mt-2"
//                         }
//         `}
//                 >
//                     {MODELS.map((m) => {
//                         const active = model === m;

//                         return (
//                             <IconButton
//                                 key={m}
//                                 onClick={() => {
//                                     setModel(m);
//                                     setOpen(false);
//                                 }}
//                                 text={m}
//                                 icon={active ? "Check" : undefined}
//                                 iconPosition="right"
//                                 size="sm"
//                                 rounded="none"
//                                 variant="optional"
//                                 textClassName="uppercase tracking-wide"
//                                 iconClassName="text-blue-400"
//                                 className={`
//                         w-full justify-between px-4 py-2.5
//                         transition
//                         ${active
//                                         ? "bg-white/10 text-white"
//                                         : "text-white/70 hover:bg-white/10"
//                                     }
//                     `}
//                             />
//                         );
//                     })}
//                 </div>
//             )}
//         </div>
//     );
// }

// "use client";

// import { useState, useRef, useEffect } from "react";
// import { useModelStore } from "@/store";
// import type { LocalModel } from "@/store";
// import { IconButton } from "@/components/ui/Icon";

// const MODELS: LocalModel[] = [
//     "llama",
//     "mistral",
//     "qwen",
//     "deepseek",
// ];

// export default function ModelSelector() {
//     const { model, setModel } = useModelStore();
//     const [open, setOpen] = useState(false);
//     const ref = useRef<HTMLDivElement>(null);

//     /* ---------------- Close on outside click ---------------- */
//     useEffect(() => {
//         const handler = (e: MouseEvent) => {
//             if (!ref.current?.contains(e.target as Node)) {
//                 setOpen(false);
//             }
//         };
//         window.addEventListener("mousedown", handler);
//         return () => window.removeEventListener("mousedown", handler);
//     }, []);

//     return (
//         <div ref={ref} className="relative">
//             {/* Trigger */}
//             <IconButton
//                 onClick={() => setOpen((v) => !v)}
//                 variant="optional"
//                 rounded="full"
//                 text={model}
//                 textClassName="uppercase tracking-wide text-sm"
//                 icon="ChevronDown"
//                 iconPosition="right"
//                 iconClassName={`text-white/60 transition-transform ${open ? "rotate-180" : ""
//                     }`}
//                 className="
//                     px-4 py-2
//                     bg-gray-700
//                     backdrop-blur-xl
//                     border border-white/10
//                     shadow-[0_0_30px_rgba(0,0,0,0.45)]
//                     hover:bg-white/15
//                 "
//             />

//             {/* Dropdown */}
//             {open && (
//                 <div
//                     className="
//                         absolute right-0 mt-2 w-3
//                         rounded-2xl
//                         bg-gray-700
//                         backdrop-blur-2xl
//                         border border-white/10
//                         shadow-[0_20px_50px_rgba(0,0,0,0.6)]
//                         overflow-hidden
//                         z-50
//                     "
//                 >
//                     {MODELS.map((m) => {
//                         const active = model === m;

//                         return (
//                             <IconButton
//                                 key={m}
//                                 onClick={() => {
//                                     setModel(m);
//                                     setOpen(false);
//                                 }}
//                                 text={m}
//                                 icon={active ? "Check" : undefined}
//                                 iconPosition="right"
//                                 size="sm"
//                                 rounded="none"
//                                 variant="optional"
//                                 textClassName="uppercase tracking-wide"
//                                 iconClassName="text-blue-400"
//                                 className={`w-full justify-between px-4 py-2.5 transition
//                                         ${active
//                                         ? "bg-white/10 text-white"
//                                         : "text-white/70 hover:bg-white/10"
//                                     }`}
//                             />
//                         );
//                     })}
//                 </div>
//             )}
//         </div>
//     );
// }