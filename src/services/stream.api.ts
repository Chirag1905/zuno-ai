export const streamChat = async ({
    chatId,
    model,
    message,
    signal,
    onChunk,
}: {
    chatId: string;
    model: string;
    message: string;
    signal: AbortSignal;
    onChunk: (text: string) => void;
}) => {
    const res = await fetch("/api/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, model, message }),
        signal,
    });

    /* ============================
       🚨 HANDLE NON-STREAM ERRORS
    ============================ */
    if (!res.ok) {
        const data = await res.json().catch(() => null);

        const error: any = new Error(data?.message || "Request failed");
        error.status = res.status;
        error.code = data?.error?.code;
        error.redirect = data?.error?.redirect;

        throw error;
    }

    if (!res.body) {
        throw new Error("Stream not supported");
    }

    /* ============================
       ✅ STREAM RESPONSE
    ============================ */
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        onChunk(full);
    }
};