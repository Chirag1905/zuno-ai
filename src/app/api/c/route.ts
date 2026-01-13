import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    const chat = await prisma.chat.create({
        data: {
            title: "New Chat",
        },
    });
    // const chat = await prisma.chat.create({
    //     data: {
    //         title: "New Chat",
    //         user: {
    //             connect: {
    //                 id: userId, // from session / auth
    //             },
    //         },
    //     },
    // });

    return NextResponse.json(chat);
}