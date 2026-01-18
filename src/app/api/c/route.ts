import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guards";

export async function GET() {
    const chats = await prisma.chat.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            title: true,
            createdAt: true,
        },
    });

    return NextResponse.json(chats);
}

export async function POST() {
    const { session } = await requireAuth();
    console.log("🚀 ~ POST ~ session:", session)
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chat = await prisma.chat.create({
        data: {
            title: "New Chat",
            user: {
                connect: {
                    id: userId,
                },
            },
        },
    });

    return NextResponse.json(chat);
}