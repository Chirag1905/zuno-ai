import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guards";
import { apiResponse } from "@/utils/apiResponse";

/* ================= GET ALL CHATS ================= */

export async function GET() {
    try {
        const chats = await prisma.chat.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                createdAt: true,
            },
        });

        return apiResponse(
            true,
            "Chats fetched successfully",
            chats,
            null,
            200
        );
    } catch (error) {
        return apiResponse(
            false,
            "Failed to fetch chats",
            null,
            error,
            500
        );
    }
}

/* ================= CREATE NEW CHAT ================= */

export async function POST() {
    try {
        const { session } = await requireAuth();
        const userId = session?.user?.id;

        if (!userId) {
            return apiResponse(
                false,
                "Unauthorized",
                null,
                "User not authenticated",
                401
            );
        }

        const chat = await prisma.chat.create({
            data: {
                title: "New Chat",
                user: {
                    connect: { id: userId },
                },
            },
        });

        return apiResponse(
            true,
            "Chat created successfully",
            chat,
            null,
            201
        );
    } catch (error) {
        return apiResponse(
            false,
            "Failed to create chat",
            null,
            error,
            500
        );
    }
}
