import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
    const { message } = await req.json();

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });

    const stream = await model.generateContentStream(message);

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
                "Transfer-Encoding": "chunked",
            },
        }
    );
}
