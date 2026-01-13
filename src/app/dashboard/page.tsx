"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { signOut, useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending)
    return <p className="text-center mt-8 text-white">Loading...</p>;
  if (!session?.user)
    return <p className="text-center mt-8 text-white">Redirecting...</p>;

  const { user } = session;

  return (
    <main className="max-w-md h-screen flex items-center justify-center flex-col mx-auto p-6 space-y-4 text-white">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {user.name || "User"}!</p>
      <p>Email: {user.email}</p>
      <button
        onClick={() => signOut()}
        className="w-full bg-white text-black font-medium rounded-md px-4 py-2 hover:bg-gray-200"
      >
        Sign Out
      </button>
    </main>
  );
}

// // "use client";

// // import { useCallback, useEffect, useRef } from "react";
// // import Sidebar from "@/components/Layout/Sidebar";
// // import Header from "@/components/Layout/Header";
// // import ChatArea from "@/components/Layout/ChatArea";
// // import {
// //   useChatStore,
// //   useLLMStore,
// //   useModelStore,
// //   useStreamStore,
// //   useUIStore,
// // } from "@/app/store";

// // export default function Home() {
// //   /* ================= STORE ================= */

// //   const {
// //     input,
// //     activeChatId,
// //     setInput,
// //     addMessage,
// //     updateMessage,
// //     ensureChatSession,
// //     loadChatSessions,
// //   } = useChatStore();

// //   const { sidebarOpen } = useUIStore();
// //   const { generating, setTyping, setGenerating } = useStreamStore();
// //   const { model } = useModelStore();
// //   const { online } = useLLMStore();
// //   // console.log("🚀 ~ Home ~ online:", online)
// //   // console.log("🚀 ~ sendMessage ~ activeChatId:", activeChatId);

// //   /* ================= REFS ================= */

// //   const abortControllerRef = useRef<AbortController | null>(null);
// //   const stopRef = useRef(false);

// //   const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// //   /* ================= SEND MESSAGE ================= */

// //   const sendMessage = async () => {
// //     if (!input.trim() || generating) return;

// //     // ✅ ensure chat exists
// //     const chatId = await ensureChatSession();
// //     const userText = input.trim();

// //     // ✅ optimistic user message (chat-scoped)
// //     addMessage(chatId, { text: userText, isUser: true });
// //     setInput("");

// //     // ✅ assistant placeholder
// //     const assistantMessageId = addMessage(chatId, {
// //       text: "",
// //       isUser: false,
// //     });

// //     setGenerating(true);
// //     setTyping(true);
// //     stopRef.current = false;

// //     // ❌ LLM offline guard
// //     if (!online) {
// //       updateMessage(
// //         chatId,
// //         assistantMessageId,
// //         "⚠️ Local LLM is offline.\n\nStart Ollama to continue."
// //       );
// //       setGenerating(false);
// //       setTyping(false);
// //       return;
// //     }

// //     abortControllerRef.current = new AbortController();

// //     let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
// //     let buffer = "";
// //     let fullText = "";
// //     let streaming = true;
// //     const decoder = new TextDecoder();

// //     try {
// //       // ⚠️ fetch is REQUIRED for streaming (axios breaks web streams)
// //       const res = await fetch("/api/stream", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           chatId,
// //           model,
// //           message: userText,
// //         }),
// //         signal: abortControllerRef.current.signal,
// //       });

// //       reader = res.body?.getReader();
// //       if (!reader) throw new Error("No stream reader");

// //       setTyping(false);
// //       await sleep(150);

// //       // ✍️ typing animation loop
// //       const typingLoop = async () => {
// //         while (!stopRef.current && (streaming || buffer.length)) {
// //           if (!buffer.length) {
// //             await sleep(8);
// //             continue;
// //           }

// //           const char = buffer[0];
// //           buffer = buffer.slice(1);
// //           fullText += char;

// //           updateMessage(chatId, assistantMessageId, fullText);
// //           await sleep(10);
// //         }
// //       };

// //       typingLoop();

// //       // 📡 read stream
// //       while (!stopRef.current) {
// //         const { value, done } = await reader.read();
// //         if (done) break;
// //         buffer += decoder.decode(value);
// //       }
// //     } catch (error) {
// //       updateMessage(
// //         chatId,
// //         assistantMessageId,
// //         error instanceof Error ? error.message : "Unknown error"
// //       );
// //     } finally {
// //       streaming = false;
// //       reader?.cancel();
// //       setGenerating(false);
// //       setTyping(false);
// //     }
// //   };

// //   // const sendMessage = async () => {
// //   //   if (!input.trim() || generating) return;

// //   //   // 🔥 ENSURE SESSION EXISTS
// //   //   const sessionId = await useChatStore
// //   //     .getState()
// //   //     .ensureSession();

// //   //   const userText = input.trim();

// //   //   // 1️⃣ User message (optimistic UI)
// //   //   addMessage({ text: userText, isUser: true });
// //   //   setInput("");

// //   //   // 2️⃣ Assistant placeholder
// //   //   const assistantId = addMessage({
// //   //     text: "",
// //   //     isUser: false,
// //   //   });

// //   //   setGenerating(true);
// //   //   setTyping(true);
// //   //   stopRef.current = false;

// //   //   // 3️⃣ LLM OFFLINE GUARD
// //   //   if (!online) {
// //   //     updateMessage(
// //   //       assistantId,
// //   //       "⚠️ Local LLM is offline.\n\nStart Ollama to continue."
// //   //     );
// //   //     setGenerating(false);
// //   //     setTyping(false);
// //   //     return;
// //   //   }

// //   //   abortControllerRef.current = new AbortController();

// //   //   let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
// //   //   let isStreaming = false;
// //   //   const decoder = new TextDecoder();
// //   //   let buffer = "";
// //   //   let fullText = "";

// //   //   try {
// //   //     const res = await fetch("/api/chat", {
// //   //       method: "POST",
// //   //       headers: { "Content-Type": "application/json" },
// //   //       body: JSON.stringify({
// //   //         message: userText,
// //   //         model,
// //   //         sessionId,
// //   //       }),
// //   //       signal: abortControllerRef.current.signal,
// //   //     });

// //   //     if (!res.ok) {
// //   //       const errText = await res.text().catch(() => "");
// //   //       updateMessage(
// //   //         assistantId,
// //   //         errText || `Request failed: ${res.status}`
// //   //       );
// //   //       return;
// //   //     }

// //   //     reader = res.body?.getReader();
// //   //     if (!reader) {
// //   //       updateMessage(assistantId, "No response body from server.");
// //   //       return;
// //   //     }

// //   //     isStreaming = true;
// //   //     setTyping(false);
// //   //     await sleep(200);

// //   //     let baseSpeed = 22;

// //   //     // 🖊️ Typing animation loop
// //   //     const typeLoop = async () => {
// //   //       while (!stopRef.current && (isStreaming || buffer.length)) {
// //   //         if (!buffer.length) {
// //   //           await sleep(12);
// //   //           continue;
// //   //         }

// //   //         const char = buffer[0];
// //   //         buffer = buffer.slice(1);
// //   //         fullText += char;

// //   //         updateMessage(assistantId, fullText);

// //   //         let delay = baseSpeed;
// //   //         if (",;:".includes(char)) delay += 60;
// //   //         if (".?!\n".includes(char)) delay += 160;
// //   //         if (fullText.includes("```")) delay = 6;

// //   //         if (fullText.length > 300) baseSpeed = 14;
// //   //         if (fullText.length > 600) baseSpeed = 10;

// //   //         await sleep(delay);
// //   //       }
// //   //     };

// //   //     typeLoop();

// //   //     // 📡 Stream from Ollama
// //   //     while (!stopRef.current) {
// //   //       const { value, done } = await reader.read();
// //   //       if (done) break;
// //   //       buffer += decoder.decode(value);
// //   //     }
// //   //   } catch (err) {
// //   //     if (!stopRef.current) {
// //   //       const msg = err instanceof Error ? err.message : "Unknown error";
// //   //       updateMessage(assistantId, `Error: ${msg}`);
// //   //     }
// //   //   } finally {
// //   //     isStreaming = false;
// //   //     try {
// //   //       await reader?.cancel();
// //   //     } catch { }
// //   //     setGenerating(false);
// //   //     setTyping(false);
// //   //   }
// //   // };

// //   /* ================= STOP ================= */

// //   const stopResponse = useCallback(() => {
// //     stopRef.current = true;
// //     abortControllerRef.current?.abort();
// //     setGenerating(false);
// //     setTyping(false);
// //   }, [setGenerating, setTyping]);

// //   /* ================= EFFECTS ================= */

// //   useEffect(() => {
// //     loadChatSessions();
// //   }, [loadChatSessions]);

// //   useEffect(() => {
// //     stopResponse();
// //   }, [activeChatId, stopResponse]);

// //   useEffect(() => {
// //     document.documentElement.classList.add("dark");
// //   }, []);

// //   // ESC key support
// //   useEffect(() => {
// //     const handler = (e: KeyboardEvent) => {
// //       if (e.key === "Escape" && generating) stopResponse();
// //     };
// //     window.addEventListener("keydown", handler);
// //     return () => window.removeEventListener("keydown", handler);
// //   }, [generating, stopResponse]);

// //   return (
// //     <main className="h-screen w-screen bg-gray-950 text-white overflow-hidden">
// //       {/* premium radial glow */}
// //       <div className="pointer-events-none absolute inset-0 overflow-hidden">
// //         <div
// //           className={`
// //       absolute inset-0
// //       transition-transform duration-500 ease-in-out
// //       ${sidebarOpen ? "translate-x-36" : "translate-x-0"}
// //     `}
// //         >
// //           <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-225 h-225 bg-blue-600/10 rounded-full blur-[120px]" />
// //           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-225 h-225 bg-purple-600/10 rounded-full blur-[120px]" />
// //         </div>
// //       </div>

// //       {/* Sidebar */}
// //       <div className="relative flex h-full p-4">
// //         <Sidebar />

// //         {/* Main Chat Area */}
// //         <div
// //           className={`relative flex-1 flex justify-center transition-all duration-500 ease-in-out
// //           ${sidebarOpen ? "pl-72" : "pl-0"}`}
// //         >
// //           <div className="w-full max-w-4xl flex flex-col overflow-hidden rounded-4xl">
// //             <Header />
// //             <ChatArea
// //               sendMessage={sendMessage}
// //               stopResponse={stopResponse}
// //             />
// //           </div>
// //         </div>
// //       </div>
// //     </main>
// //   );
// // }

// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { redirect } from "next/navigation";

// export default async function DashboardPage() {
//   const session = await getServerSession(authOptions);

//   console.log("✅ DASHBOARD SESSION:", session);

//   if (!session) {
//     redirect("/login");
//   }

//   return (
//     <div>
//       <h1>Dashboard</h1>
//       <p>Welcome {session.user?.email}</p>
//     </div>
//   );
// }

