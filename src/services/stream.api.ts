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

    if (!res.body) throw new Error("Stream not supported");

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let full = "";

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        full += decoder.decode(value);
        onChunk(full);
    }
};
