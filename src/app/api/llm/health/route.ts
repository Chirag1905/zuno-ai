export async function GET() {
    try {
        const res = await fetch(
            `${process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434"}/api/tags`,
            {
                cache: "no-store",
            });

        if (!res.ok) throw new Error("offline");

        return Response.json({ online: true });
    } catch (e) {
        console.error("LLM health check failed", e);
        return Response.json({ online: false });
    }
}
