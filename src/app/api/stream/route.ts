import { NextRequest } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guards";
import { apiResponse } from "@/types/apiResponse";
import { getActiveSubscription } from "@/lib/billing/getActiveSubscription";

export const runtime = "nodejs";

/* ============================
   CONFIG
============================ */

const MODEL_MAP: Record<string, string> = {
    llama: "llama3.1:8b",
    mistral: "mistral:7b-instruct",
    qwen: "qwen2.5:7b",
    deepseek: "deepseek-r1:7b",
};

const MAX_CONTEXT_MESSAGES = 12;
const RATE_LIMIT_MS = 3000;

// naive but consistent token estimator
const estimateTokens = (text: string) =>
    Math.ceil(text.length / 4);

/* ============================
   POST /api/stream
============================ */

export async function POST(req: NextRequest) {
    /* ============================
       1️⃣ AUTH
    ============================ */
    const { session } = await requireAuth();
    const userId = session.user.id;

    const { chatId, message, model } = await req.json();

    if (!chatId || !message || !message.trim()) {
        return apiResponse(false, "Invalid payload", null, null, 400);
    }

    /* ============================
       2️⃣ CHAT OWNERSHIP
    ============================ */
    const chat = await prisma.chat.findFirst({
        where: { id: chatId, userId },
    });

    if (!chat) {
        return apiResponse(false, "Chat not found", null, null, 404);
    }

    /* ============================
       3️⃣ RATE LIMIT
    ============================ */
    const lastUserMsg = await prisma.chatMessage.findFirst({
        where: { chatId, role: "USER" },
        orderBy: { createdAt: "desc" },
    });

    if (
        lastUserMsg &&
        Date.now() - lastUserMsg.createdAt.getTime() < RATE_LIMIT_MS
    ) {
        return apiResponse(false, "Too many requests", null, null, 429);
    }

    /* ============================
       4️⃣ STREAM LOCK
    ============================ */
    const lock = await prisma.chat.updateMany({
        where: { id: chatId, isStreaming: false },
        data: { isStreaming: true },
    });

    if (lock.count === 0) {
        return apiResponse(false, "Chat is busy", null, null, 409);
    }

    /* ============================
       5️⃣ SAVE USER MESSAGE
    ============================ */
    const userMessage = await prisma.chatMessage.create({
        data: {
            chatId,
            role: "USER",
            content: message,
        },
    });

    /* ============================
       6️⃣ CONTEXT WINDOW
    ============================ */
    const recentMessages = await prisma.chatMessage.findMany({
        where: { chatId },
        orderBy: { createdAt: "desc" },
        take: MAX_CONTEXT_MESSAGES,
    });

    // const context = recentMessages
    //     .reverse()
    //     .map((m) => m.content)
    //     .join("\n\n");

    const context = recentMessages
        .reverse()
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

    const finalPrompt = `${context}\nUSER: ${message}\nASSISTANT:`;


    /* ============================
       7️⃣ SUBSCRIPTION + TOKENS
    ============================ */
    const subscription = await getActiveSubscription(userId);

    if (!subscription || subscription.tokensRemaining <= 0) {
        await prisma.chat.update({
            where: { id: chatId },
            data: { isStreaming: false },
        });

        return apiResponse(
            false,
            "Token limit exceeded",
            null,
            { redirect: "/pricing" },
            402
        );
    }

    /* ============================
       8️⃣ OLLAMA REQUEST
    ============================ */
    const abortController = new AbortController();
    req.signal.addEventListener("abort", () => {
        abortController.abort();
    });

    let ollamaRes;
    try {
        ollamaRes = await axios.post(
            "http://127.0.0.1:11434/api/generate",
            {
                model: MODEL_MAP[model] ?? MODEL_MAP.llama,
                // prompt: context,
                prompt: finalPrompt,
                stream: true,
            },
            {
                responseType: "stream",
                timeout: 60000,
                signal: abortController.signal,
            }
        );
    } catch (err) {
        console.error("[OLLAMA_ERROR]", err);

        await prisma.chat.update({
            where: { id: chatId },
            data: { isStreaming: false },
        });

        return apiResponse(false, "Assistant offline", null, null, 503);
    }

    /* ============================
       9️⃣ STREAM RESPONSE
    ============================ */
    let assistantText = "";
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        start(controller) {
            const reader = ollamaRes.data;

            reader.on("data", (chunk: Buffer) => {
                const lines = chunk
                    .toString("utf8")
                    .split("\n")
                    .filter(Boolean);

                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);
                        if (json.response) {
                            assistantText += json.response;
                            controller.enqueue(encoder.encode(json.response));
                        }
                    } catch {
                        // ignore malformed chunks
                    }
                }
            });

            /* ============================
               🔟 STREAM END (SAVE + BILL)
            ============================ */
            reader.on("end", async () => {
                const usedTokens = estimateTokens(assistantText);

                try {
                    await prisma.$transaction([
                        // 1️⃣ Save assistant message
                        prisma.chatMessage.create({
                            data: {
                                chatId,
                                role: "ASSISTANT",
                                content: assistantText,
                                model: MODEL_MAP[model] ?? MODEL_MAP.llama,
                                tokens: usedTokens,
                                parentId: userMessage.id,
                            },
                        }),

                        // 2️⃣ 🔥 DECREMENT TOKENS (THIS IS THE LINE YOU ASKED ABOUT)
                        prisma.subscription.update({
                            where: { id: subscription.id },
                            data: {
                                tokensRemaining: {
                                    decrement: usedTokens,
                                },
                            },
                        }),

                        // 3️⃣ Unlock chat
                        prisma.chat.update({
                            where: { id: chatId },
                            data: { isStreaming: false },
                        }),
                    ]);
                } catch (err) {
                    console.error("[STREAM_END_ERROR]", err);

                    await prisma.chat.update({
                        where: { id: chatId },
                        data: { isStreaming: false },
                    });
                }

                controller.close();
            });

            reader.on("error", async (err: unknown) => {
                console.error("[STREAM_ERROR]", err);

                await prisma.chat.update({
                    where: { id: chatId },
                    data: { isStreaming: false },
                });

                controller.error(new Error("Stream failed"));
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
        },
    });
}


// import { NextRequest } from "next/server";
// import axios from "axios";
// import prisma from "@/lib/prisma";
// import { requireAuth } from "@/lib/auth/guards";
// import { apiResponse } from "@/utils/apiResponse";
// import { getActiveSubscription } from "@/lib/billing/getActiveSubscription";

// export const runtime = "nodejs";

// /* ============================
//    CONFIG
// ============================ */

// const MODEL_MAP: Record<string, string> = {
//     llama: "llama3.1:8b",
//     mistral: "mistral:7b-instruct",
//     qwen: "qwen2.5:7b",
//     deepseek: "deepseek-r1:7b",
// };  

// const MAX_CONTEXT_MESSAGES = 12;
// const RATE_LIMIT_MS = 3000;

// // naive token estimator (good enough)
// const estimateTokens = (text: string) =>
//     Math.ceil(text.length / 4);

// /* ============================
//    POST /api/stream
// ============================ */

// export async function POST(req: NextRequest) {
//     /* ============================
//        1️⃣ AUTH
//     ============================ */
//     const { session } = await requireAuth();
//     const userId = session.user.id;

//     const { chatId, message, model } = await req.json();

//     if (!chatId || !message || !message.trim()) {
//         return apiResponse(false, "Invalid payload", null, null, 400);
//     }

//     /* ============================
//        2️⃣ OWNERSHIP CHECK
//     ============================ */
//     const chat = await prisma.chat.findFirst({
//         where: { id: chatId, userId },
//     });

//     if (!chat) {
//         return apiResponse(false, "Chat not found", null, null, 404);
//     }

//     /* ============================
//        3️⃣ RATE LIMIT (per chat)
//     ============================ */
//     const lastUserMsg = await prisma.chatMessage.findFirst({
//         where: { chatId, role: "USER" },
//         orderBy: { createdAt: "desc" },
//     });

//     if (
//         lastUserMsg &&
//         Date.now() - lastUserMsg.createdAt.getTime() < RATE_LIMIT_MS
//     ) {
//         return apiResponse(false, "Too many requests", null, null, 429);
//     }

//     /* ============================
//        4️⃣ STREAMING LOCK (atomic)
//     ============================ */
//     const lock = await prisma.chat.updateMany({
//         where: {
//             id: chatId,
//             isStreaming: false,
//         },
//         data: {
//             isStreaming: true,
//         },
//     });

//     if (lock.count === 0) {
//         return apiResponse(false, "Chat is busy", null, null, 409);
//     }

//     /* ============================
//        5️⃣ SAVE USER MESSAGE
//     ============================ */
//     const userMessage = await prisma.chatMessage.create({
//         data: {
//             chatId,
//             role: "USER",
//             content: message,
//         },
//     });

//     /* ============================
//        6️⃣ CONTEXT WINDOW
//     ============================ */
//     const recentMessages = await prisma.chatMessage.findMany({
//         where: { chatId },
//         orderBy: { createdAt: "desc" },
//         take: MAX_CONTEXT_MESSAGES,
//     });

//     const context = recentMessages
//         .reverse()
//         .map((m) => m.content)
//         .join("\n\n");

//     /* ============================
//        7️⃣ SUBSCRIPTION CHECK
//     ============================ */
//     const subscription = await getActiveSubscription(userId);

//     if (!subscription || subscription.tokensRemaining <= 0) {
//         await prisma.chat.update({
//             where: { id: chatId },
//             data: { isStreaming: false },
//         });

//         return apiResponse(
//             false,
//             "Token limit exceeded",
//             null,
//             { redirect: "/pricing" },
//             402
//         );
//     }

//     /* ============================
//        8️⃣ STREAM SETUP
//     ============================ */
//     const abortController = new AbortController();
//     req.signal.addEventListener("abort", () => {
//         abortController.abort();
//     });

//     let ollamaRes;

//     try {
//         ollamaRes = await axios.post(
//             "http://127.0.0.1:11434/api/generate",
//             {
//                 model: MODEL_MAP[model] ?? MODEL_MAP.llama,
//                 prompt: context,
//                 stream: true,
//             },
//             {
//                 responseType: "stream",
//                 timeout: 5000,
//                 signal: abortController.signal,
//             }
//         );
//     } catch (err) {
//         console.error("[OLLAMA_INIT_ERROR]", err);

//         await prisma.chatMessage.create({
//             data: {
//                 chatId,
//                 role: "SYSTEM",
//                 content: "⚠️ Assistant is currently unavailable.",
//             },
//         });

//         await prisma.chat.update({
//             where: { id: chatId },
//             data: { isStreaming: false },
//         });

//         return apiResponse(false, "Assistant offline", null, null, 503);
//     }

//     /* ============================
//        9️⃣ STREAM RESPONSE
//     ============================ */
//     let assistantText = "";
//     const encoder = new TextEncoder();

//     const stream = new ReadableStream({
//         start(controller) {
//             const reader = ollamaRes.data;

//             reader.on("data", (chunk: Buffer) => {
//                 const lines = chunk
//                     .toString("utf8")
//                     .split("\n")
//                     .filter(Boolean);

//                 for (const line of lines) {
//                     try {
//                         const json = JSON.parse(line);
//                         if (json.response) {
//                             assistantText += json.response;
//                             controller.enqueue(
//                                 encoder.encode(json.response)
//                             );
//                         }
//                     } catch {
//                         // ignore malformed chunks
//                     }
//                 }
//             });

//             reader.on("end", async () => {
//                 const usedTokens = estimateTokens(assistantText);

//                 try {
//                     await prisma.$transaction([
//                         prisma.chatMessage.create({
//                             data: {
//                                 chatId,
//                                 role: "ASSISTANT",
//                                 content: assistantText,
//                                 model:
//                                     MODEL_MAP[model] ??
//                                     MODEL_MAP.llama,
//                                 tokens: usedTokens,
//                                 parentId: userMessage.id,
//                             },
//                         }),
//                         prisma.subscription.update({
//                             where: { id: subscription.id },
//                             data: {
//                                 tokensRemaining: {
//                                     decrement: usedTokens,
//                                 },
//                             },
//                         }),
//                         prisma.chat.update({
//                             where: { id: chatId },
//                             data: { isStreaming: false },
//                         }),
//                     ]);
//                 } catch (err) {
//                     console.error("[STREAM_END_ERROR]", err);

//                     await prisma.chat.update({
//                         where: { id: chatId },
//                         data: { isStreaming: false },
//                     });
//                 }

//                 controller.close();
//             });

//             reader.on("error", async (err: any) => {
//                 console.error("[STREAM_ERROR]", err);

//                 await prisma.chatMessage.create({
//                     data: {
//                         chatId,
//                         role: "SYSTEM",
//                         content: "⚠️ Assistant stream interrupted.",
//                     },
//                 });

//                 await prisma.chat.update({
//                     where: { id: chatId },
//                     data: { isStreaming: false },
//                 });

//                 controller.error(new Error("Stream failed"));
//             });
//         },
//     });

//     return new Response(stream, {
//         headers: {
//             "Content-Type": "text/plain; charset=utf-8",
//             "Cache-Control": "no-cache",
//         },
//     });
// }

