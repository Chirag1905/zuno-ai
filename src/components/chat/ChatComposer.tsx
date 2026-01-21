"use client";

import { IconButton } from "@/components/ui/Icon";
import ModelSelector from "@/components/ui/ModelSelector";
import { useChatStore, useStreamStore } from "@/store";
import { useEffect, useRef, useState } from "react";

type ChatComposerProps = {
    sendMessage: () => void;
    stopResponse: () => void;
    value?: string;
    onChange?: (value: string) => void;
};

export default function ChatComposer({
    sendMessage,
    stopResponse,
    value,
    onChange,
}: ChatComposerProps) {
    const { input: storeInput, setInput } = useChatStore();
    const { generating } = useStreamStore();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isMultiline, setIsMultiline] = useState(false);

    const input = value ?? storeInput;
    const setValue = onChange ?? setInput;

    /* -------------------- Auto resize + multiline detection -------------------- */
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = "0px";
        const height = Math.min(el.scrollHeight, 160);
        el.style.height = height + "px";

        // ~3 lines threshold (depends on font-size & leading)
        setIsMultiline(height > 64);
    }, [input]);

    return (
        <div className="w-full pb-4">
            <div className="w-full max-w-210 mx-auto px-2">
                <div className="flex flex-col gap-2 px-5 py-3 rounded-4xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)]">

                    {/* TOP ROW */}
                    <div className={`flex gap-3 py-2.5 ${isMultiline ? "items-start" : "items-center"}`}>
                        <textarea
                            ref={textareaRef}
                            value={input}
                            rows={1}
                            disabled={generating}
                            placeholder="Message Zuno"
                            className="flex-1 bg-transparent resize-none text-sm text-white focus:outline-none leading-6 max-h-40 overflow-y-auto"
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Enter" &&
                                    !e.shiftKey &&
                                    !e.nativeEvent.isComposing
                                ) {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                        />

                        {/* INLINE ACTIONS (single-line mode) */}
                        {!isMultiline && (
                            <>
                                <ModelSelector />
                                <IconButton
                                    icon={generating ? "Square" : "ArrowUp"}
                                    size="lg"
                                    variant="minimal"
                                    compact
                                    className="bg-gray-800 hover:bg-gray-700 rounded-full"
                                    iconClassName={
                                        generating ? "text-red-400" : "text-blue-400"
                                    }
                                    onClick={generating ? stopResponse : sendMessage}
                                />
                            </>
                        )}
                    </div>

                    {/* BOTTOM ACTION ROW (multiline mode) */}
                    {isMultiline && (
                        <div className="flex justify-end gap-2 py-2">
                            <ModelSelector />
                            <IconButton
                                icon={generating ? "Square" : "ArrowUp"}
                                size="lg"
                                variant="minimal"
                                compact
                                className="bg-gray-800 hover:bg-gray-700 rounded-full"
                                iconClassName={
                                    generating ? "text-red-400" : "text-blue-400"
                                }
                                onClick={generating ? stopResponse : sendMessage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


// "use client";

// import { IconButton } from "@/components/ui/Icon";
// import ModelSelector from "@/components/ui/ModelSelector";
// import { useChatStore, useStreamStore } from "@/store";
// import { useEffect, useRef, useState } from "react";

// type ChatComposerProps = {
//     sendMessage: () => void;
//     stopResponse: () => void;
//     value?: string;
//     onChange?: (value: string) => void;
// };

// export default function ChatComposer({
//     sendMessage,
//     stopResponse,
//     value,
//     onChange,
// }: ChatComposerProps) {
//     const { input: storeInput, setInput } = useChatStore();
//     const { generating } = useStreamStore();

//     const [isMultiline, setIsMultiline] = useState(false);

//     const textareaRef = useRef<HTMLTextAreaElement>(null);

//     const input = value ?? storeInput;
//     const setValue = onChange ?? setInput;

//     useEffect(() => {
//         const el = textareaRef.current;
//         if (!el) return;

//         el.style.height = "0px";
//         const height = Math.min(el.scrollHeight, 160);
//         el.style.height = height + "px";

//         // Roughly 3 lines = ~72px (depends on font/line-height)
//         setIsMultiline(height > 64);
//     }, [input]);

//     // useEffect(() => {
//     //     if (!textareaRef.current) return;
//     //     textareaRef.current.style.height = "0px";
//     //     textareaRef.current.style.height =
//     //         Math.min(textareaRef.current.scrollHeight, 160) + "px";
//     // }, [input]);

//     return (
//         <div className="w-full pb-4">
//             {/* <div className="w-full max-w-210 mx-auto px-2"> */}
//             <div className="sticky bottom-0 w-full pt-4 mx-auto px-4 bg-linear-to-t from-black/80 via-black/40 to-transparent">
//                 <div className="flex items-center gap-3 px-5 py-2.5 rounded-4xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
//                     <textarea
//                         ref={textareaRef}
//                         value={input}
//                         rows={1}
//                         disabled={generating}
//                         placeholder="Message Zuno"
//                         className="flex-1 bg-transparent resize-none text-sm text-white focus:outline-none leading-6 max-h-40 overflow-y-auto"
//                         onChange={(e) => setValue(e.target.value)}
//                         onKeyDown={(e) => {
//                             if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
//                                 e.preventDefault();
//                                 sendMessage();
//                             }
//                         }}
//                     />

//                     <ModelSelector />
//                     <IconButton
//                         icon={generating ? "Square" : "ArrowUp"}
//                         size="lg"
//                         variant="minimal"
//                         compact
//                         className="bg-gray-800 hover:bg-gray-700 rounded-full"
//                         iconClassName={generating ? "text-red-400" : "text-blue-400"}
//                         onClick={generating ? stopResponse : sendMessage}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// }