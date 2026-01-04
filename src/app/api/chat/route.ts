import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
    let message: unknown;
    try {
        const body = await req.json();
        message = (body as { message?: unknown })?.message;
    } catch {
        return new Response("Invalid JSON body.", { status: 400 });
    }

    if (typeof message !== "string" || message.trim().length === 0) {
        return new Response("Missing 'message' in request body.", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return new Response(
            "Server misconfigured: missing GEMINI_API_KEY in environment.",
            { status: 500 }
        );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });

    let stream;
    try {
        stream = await model.generateContentStream(message);
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return new Response(`Failed to contact Gemini: ${msg}`,
            {
                status: 502,
                headers: { "Content-Type": "text/plain; charset=utf-8" },
            }
        );
    }

    const encoder = new TextEncoder();

    return new Response(
        new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream.stream) {
                        const text = chunk.text();
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            },
        }),
        {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache",
            },
        }
    );
}
