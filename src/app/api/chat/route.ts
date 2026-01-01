import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!).getGenerativeModel({
    model: "gemini-2.5-flash",
});

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: message }],
                },
            ],
        });

        const text = result.response.text();
        return NextResponse.json({ reply: text });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Gemini API Error:", errorMessage);
        return NextResponse.json({ reply: errorMessage }, { status: 500 });
    }
}
