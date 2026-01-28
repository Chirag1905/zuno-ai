import { NextRequest } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guards";
import { apiResponse } from "@/utils/apiResponse";

export const runtime = "nodejs";

const MODEL_MAP: Record<string, string> = {
    llama: "llama3.1:8b",
    mistral: "mistral:7b-instruct",
    qwen: "qwen2.5:7b",
    deepseek: "deepseek-r1:7b",
};

const MAX_CONTEXT_MESSAGES = 12;
const RATE_LIMIT_MS = 3000;

// naive token estimator (good enough for tracking)
const estimateTokens = (text: string) =>
    Math.ceil(text.length / 4);

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
       2️⃣ OWNERSHIP CHECK
    ============================ */
    const chat = await prisma.chat.findFirst({
        where: { id: chatId, userId },
    });

    if (!chat) {
        return apiResponse(false, "Chat not found", null, null, 404);
    }

    /* ============================
       3️⃣ RATE LIMIT (per chat)
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
       4️⃣ RACE-CONDITION LOCK
    ============================ */
    const lock = await prisma.chat.updateMany({
        where: {
            id: chatId,
            isStreaming: false,
        },
        data: {
            isStreaming: true,
        },
    });

    if (lock.count === 0) {
        return apiResponse(false, "Chat is busy", null, null, 409);
    }

    await prisma.chat.update({
        where: { id: chatId },
        data: { isStreaming: true },
    });

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

    const context = recentMessages
        .reverse()
        .map((m) => ({
            role: m.role.toLowerCase(),
            content: m.content,
        }));

    /* ============================
       7️⃣ STREAM CANCELLATION
    ============================ */
    const abortController = new AbortController();
    req.signal.addEventListener("abort", () => {
        abortController.abort();
    });

    /* ============================
       8️⃣ CALL OLLAMA
    ============================ */
    let ollamaRes;

    try {
        ollamaRes = await axios.post(
            "http://127.0.0.1:11434/api/generate",
            {
                model: MODEL_MAP[model] ?? MODEL_MAP.llama,
                prompt: context.map(m => m.content).join("\n\n"),
                stream: true,
            },
            {
                responseType: "stream",
                timeout: 5000,
                signal: abortController.signal,
            }
        );
    } catch (err) {
        console.error("Ollama error:", err);
        await prisma.chatMessage.create({
            data: {
                chatId,
                role: "SYSTEM",
                content: "⚠️ Assistant is currently unavailable.",
            },
        });

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
                const lines = chunk.toString("utf8").split("\n").filter(Boolean);

                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);
                        if (json.response) {
                            assistantText += json.response;
                            controller.enqueue(encoder.encode(json.response));
                        }
                    } catch { }
                }
            });

            reader.on("end", async () => {
                /* ============================
                   🔟 SAVE ASSISTANT MESSAGE
                ============================ */
                await prisma.chatMessage.create({
                    data: {
                        chatId,
                        role: "ASSISTANT",
                        content: assistantText,
                        model: MODEL_MAP[model] ?? MODEL_MAP.llama,
                        tokens: estimateTokens(assistantText),
                        parentId: userMessage.id, // 🗂 versioning link
                    },
                });

                await prisma.chat.update({
                    where: { id: chatId },
                    data: { isStreaming: false },
                });

                controller.close();
            });

            reader.on("error", async () => {
                await prisma.chatMessage.create({
                    data: {
                        chatId,
                        role: "SYSTEM",
                        content: "⚠️ Assistant stream interrupted.",
                    },
                });

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

// export const runtime = "nodejs"; // axios + prisma safe

// const MODEL_MAP: Record<string, string> = {
//     llama: "llama3.1:8b",
//     mistral: "mistral:7b-instruct",
//     qwen: "qwen2.5:7b",
//     deepseek: "deepseek-r1:7b",
// };

// export async function POST(req: NextRequest) {
//     try {
//         /* ============================
//            1️⃣ AUTHENTICATION
//         ============================ */
//         const { session } = await requireAuth();
//         const userId = session.user.id;

//         /* ============================
//            2️⃣ VALIDATE INPUT
//         ============================ */
//         const body = await req.json();
//         const { chatId, message, model } = body;

//         if (
//             typeof chatId !== "string" ||
//             typeof message !== "string" ||
//             message.trim().length === 0
//         ) {
//             return apiResponse(
//                 false,
//                 "Invalid request payload",
//                 null,
//                 { chatId, message },
//                 400
//             );
//         }

//         /* ============================
//            3️⃣ VERIFY CHAT OWNERSHIP
//         ============================ */
//         const chat = await prisma.chat.findFirst({
//             where: {
//                 id: chatId,
//                 userId,
//             },
//         });

//         if (!chat) {
//             return apiResponse(
//                 false,
//                 "Chat not found",
//                 null,
//                 null,
//                 404
//             );
//         }

//         /* ============================
//            4️⃣ SAVE USER MESSAGE
//         ============================ */
//         await prisma.chatMessage.create({
//             data: {
//                 chatId,
//                 role: "USER",
//                 content: message,
//             },
//         });

//         /* ============================
//            5️⃣ CALL OLLAMA (STREAMING)
//         ============================ */
//         const ollamaModel = MODEL_MAP[model] ?? MODEL_MAP.llama;

//         const ollamaRes = await axios.post(
//             "http://127.0.0.1:11434/api/generate",
//             {
//                 model: ollamaModel,
//                 prompt: message,
//                 stream: true,
//             },
//             {
//                 responseType: "stream",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         let assistantText = "";
//         const encoder = new TextEncoder();

//         const stream = new ReadableStream({
//             start(controller) {
//                 const reader = ollamaRes.data; // Node.js stream

//                 reader.on("data", (chunk: Buffer) => {
//                     const lines = chunk
//                         .toString("utf8")
//                         .split("\n")
//                         .filter(Boolean);

//                     for (const line of lines) {
//                         try {
//                             const json = JSON.parse(line);

//                             if (json.thinking) continue;

//                             if (json.response) {
//                                 assistantText += json.response;
//                                 controller.enqueue(
//                                     encoder.encode(json.response)
//                                 );
//                             }
//                         } catch {
//                             // ignore malformed chunks
//                         }
//                     }
//                 });

//                 reader.on("end", async () => {
//                     /* ============================
//                        6️⃣ SAVE ASSISTANT MESSAGE
//                     ============================ */
//                     if (assistantText.trim()) {
//                         await prisma.chatMessage.create({
//                             data: {
//                                 chatId,
//                                 role: "ASSISTANT",
//                                 content: assistantText,
//                             },
//                         });
//                     }

//                     controller.close();
//                 });

//                 reader.on("error", async (err: Error) => {
//                     console.error("Ollama stream error:", err);

//                     /* ============================
//                        7️⃣ SYSTEM FALLBACK MESSAGE
//                     ============================ */
//                     await prisma.chatMessage.create({
//                         data: {
//                             chatId,
//                             role: "SYSTEM",
//                             content:
//                                 "⚠️ Assistant failed to generate a response.",
//                         },
//                     });

//                     controller.error(err);
//                 });
//             },
//         });

//         /* ============================
//            8️⃣ STREAM RESPONSE (NON-JSON)
//         ============================ */
//         return new Response(stream, {
//             headers: {
//                 "Content-Type": "text/plain; charset=utf-8",
//                 "Cache-Control": "no-cache",
//             },
//         });
//     } catch (error) {
//         console.error("Chat send error:", error);

//         return apiResponse(
//             false,
//             "Unauthorized",
//             null,
//             error,
//             401
//         );
//     }
// }


// import { NextRequest } from "next/server";
// import axios from "axios";
// import prisma from "@/lib/prisma";

// export const runtime = "nodejs"; // ✅ REQUIRED (axios streams won't work on edge)

// const MODEL_MAP: Record<string, string> = {
//     llama: "llama3.1:8b",
//     mistral: "mistral:7b-instruct",
//     qwen: "qwen2.5:7b",
//     deepseek: "deepseek-r1:7b",
// };

// export async function POST(req: NextRequest) {
//     const { chatId, message, model } = await req.json();

//     if (!chatId || !message) {
//         return new Response("Invalid request", { status: 400 });
//     }

//     const ollamaModel = MODEL_MAP[model] ?? MODEL_MAP.llama;

//     /* ----------------------------------
//        1️⃣ SAVE USER MESSAGE
//     ---------------------------------- */
//     await prisma.chatMessage.create({
//         data: {
//             chatId,
//             content: message,
//             role: "USER",
//         },
//     });

//     /* ----------------------------------
//        2️⃣ CALL OLLAMA (AXIOS STREAM)
//     ---------------------------------- */
//     const ollamaRes = await axios.post(
//         "http://127.0.0.1:11434/api/generate",
//         {
//             model: ollamaModel,
//             prompt: message,
//             stream: true,
//         },
//         {
//             responseType: "stream",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//         }
//     );

//     let assistantText = "";
//     const encoder = new TextEncoder();

//     const stream = new ReadableStream({
//         start(controller) {
//             const reader = ollamaRes.data; // Node.js Readable stream

//             reader.on("data", (chunk: Buffer) => {
//                 const lines = chunk
//                     .toString("utf8") // ✅ Buffer decoding (TextDecoder NOT needed)
//                     .split("\n")
//                     .filter(Boolean);

//                 for (const line of lines) {
//                     try {
//                         const json = JSON.parse(line);

//                         // Ignore internal reasoning if present
//                         if (json.thinking) continue;

//                         if (json.response) {
//                             assistantText += json.response;
//                             controller.enqueue(encoder.encode(json.response));
//                         }
//                     } catch {
//                         // Ignore malformed JSON chunks
//                     }
//                 }
//             });

//             reader.on("end", async () => {
//                 /* ----------------------------------
//                    3️⃣ SAVE ASSISTANT MESSAGE
//                 ---------------------------------- */
//                 if (assistantText.trim()) {
//                     await prisma.chatMessage.create({
//                         data: {
//                             chatId,
//                             content: assistantText,
//                             role: "ASSISTANT",
//                         },
//                     });
//                 }

//                 controller.close();
//             });

//             reader.on("error", (err: Error) => {
//                 console.error("Ollama stream error:", err);
//                 controller.error(err);
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


// import { NextRequest } from "next/server";
// import axios from "axios";
// import prisma from "@/app/lib/prisma";

// const MODEL_MAP: Record<string, string> = {
//     llama: "llama3.1:8b",
//     mistral: "mistral:7b-instruct",
//     qwen: "qwen2.5:7b",
//     deepseek: "deepseek-r1:7b",
// };

// export async function POST(req: NextRequest) {
//     const { message, model, sessionId } = await req.json();

//     if (!sessionId) {
//         return new Response("Missing sessionId", { status: 400 });
//     }

//     const ollamaModel = MODEL_MAP[model] ?? MODEL_MAP.llama;

//     /* -------------------------------
//      1️⃣ Save USER message
//     -------------------------------- */
//     await prisma.message.create({
//         data: {
//             content: message,
//             role: "USER",
//             sessionId,
//         },
//     });

//     /* -------------------------------
//      2️⃣ Call Ollama via Axios (stream)
//     -------------------------------- */
//     const ollamaRes = await axios.post(
//         "http://127.0.0.1:11434/api/generate",
//         {
//             model: ollamaModel,
//             prompt: message,
//             stream: true,
//         },
//         {
//             responseType: "stream",
//             headers: { "Content-Type": "application/json" },
//         }
//     );

//     const encoder = new TextEncoder();
//     let assistantText = "";

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

//                         // ❌ Drop internal reasoning
//                         if (json.thinking) return;

//                         // ✅ Stream visible response
//                         if (json.response) {
//                             assistantText += json.response;
//                             controller.enqueue(encoder.encode(json.response));
//                         }
//                     } catch {
//                         // ignore malformed chunks
//                     }
//                 }
//             });

//             reader.on("end", async () => {
//                 /* -------------------------------
//                  3️⃣ Save ASSISTANT message
//                 -------------------------------- */
//                 if (assistantText.trim()) {
//                     await prisma.message.create({
//                         data: {
//                             content: assistantText,
//                             role: "ASSISTANT",
//                             sessionId,
//                         },
//                     });
//                 }

//                 controller.close();
//             });

//             reader.on("error", (err: Error) => {
//                 console.error("Ollama stream error:", err);
//                 controller.close();
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


// import { NextRequest } from "next/server";

// const MODEL_MAP: Record<string, string> = {
//     llama: "llama3.1:8b",
//     mistral: "mistral:7b-instruct",
//     qwen: "qwen2.5:7b",
//     deepseek: "deepseek-r1:7b",
// };

// export async function POST(req: NextRequest) {
//     const { message, model } = await req.json();
//     const ollamaModel = MODEL_MAP[model] ?? MODEL_MAP.llama;

//     const ollamaRes = await fetch("http://127.0.0.1:11434/api/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//             model: ollamaModel,
//             prompt: message,
//             stream: true,
//         }),
//     });

//     const encoder = new TextEncoder();
//     const decoder = new TextDecoder();

//     const stream = new ReadableStream({
//         async start(controller) {
//             const reader = ollamaRes.body?.getReader();
//             if (!reader) {
//                 controller.close();
//                 return;
//             }

//             while (true) {
//                 const { value, done } = await reader.read();
//                 if (done) break;

//                 const chunk = decoder.decode(value);
//                 const lines = chunk.split("\n").filter(Boolean);

//                 for (const line of lines) {
//                     const json = JSON.parse(line);

//                     // ❌ DROP internal reasoning
//                     if (json.thinking) continue;

//                     // ✅ FORWARD user-visible text
//                     if (json.response) {
//                         controller.enqueue(encoder.encode(json.response));
//                     }
//                 }
//             }

//             controller.close();
//         },
//     });

//     return new Response(stream, {
//         headers: { "Content-Type": "text/plain; charset=utf-8" },
//     });
// }


// import { GoogleGenerativeAI } from "@google/generative-ai";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//     let message: unknown;
//     try {
//         const body = await req.json();
//         message = (body as { message?: unknown })?.message;
//     } catch {
//         return new Response("Invalid JSON body.", { status: 400 });
//     }

//     if (typeof message !== "string" || message.trim().length === 0) {
//         return new Response("Missing 'message' in request body.", { status: 400 });
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//         return new Response(
//             "Server misconfigured: missing GEMINI_API_KEY in environment.",
//             { status: 500 }
//         );
//     }

//     const genAI = new GoogleGenerativeAI(apiKey);

//     const model = genAI.getGenerativeModel({
//         model: "gemini-2.5-flash",
//     });

//     let stream;
//     try {
//         stream = await model.generateContentStream(message);
//     } catch (err) {
//         const msg = err instanceof Error ? err.message : "Unknown error";
//         return new Response(`Failed to contact Gemini: ${msg}`,
//             {
//                 status: 502,
//                 headers: { "Content-Type": "text/plain; charset=utf-8" },
//             }
//         );
//     }

//     const encoder = new TextEncoder();

//     return new Response(
//         new ReadableStream({
//             async start(controller) {
//                 try {
//                     for await (const chunk of stream.stream) {
//                         const text = chunk.text();
//                         if (text) {
//                             controller.enqueue(encoder.encode(text));
//                         }
//                     }
//                     controller.close();
//                 } catch (err) {
//                     controller.error(err);
//                 }
//             },
//         }),
//         {
//             headers: {
//                 "Content-Type": "text/plain; charset=utf-8",
//                 "Cache-Control": "no-cache",
//             },
//         }
//     );
// }
