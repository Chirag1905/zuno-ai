import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guards";
import { apiResponse } from "@/utils/apiResponse";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/auth/errors";
import { CHAT_ERROR_MESSAGES } from "@/lib/errors/chat.error";

/* ================= GET ALL CHATS ================= */

export async function GET() {
    try {
        const { session } = await requireAuth();
        const userId = session.user.id;
        const chats = await prisma.chat.findMany({
            where: { userId },
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
    } catch (e) {
        if (e instanceof AuthError) {
            return apiResponse(
                false,
                AUTH_ERROR_MESSAGES[e.code],
                null,
                { code: e.code },
                e.status // ✅ 401, 403, etc
            );
        }

        console.error("[GET_CHATS_ERROR]", e);

        return apiResponse(
            false,
            CHAT_ERROR_MESSAGES.CHAT_INTERNAL,
            null,
            { code: "CHAT_INTERNAL" },
            500
        );
    }
}

/* ================= CREATE NEW CHAT ================= */

export async function POST() {
    try {
        const { session } = await requireAuth();

        const chat = await prisma.chat.create({
            data: {
                title: "New Chat",
                userId: session.user.id,
            },
        });

        return apiResponse(true, "Chat created successfully", chat, null, 201);
    } catch (e) {
        if (e instanceof AuthError) {
            return apiResponse(
                false,
                AUTH_ERROR_MESSAGES[e.code],
                null,
                { code: e.code },
                e.status
            );
        }

        return apiResponse(
            false,
            CHAT_ERROR_MESSAGES.CHAT_CREATE_FAILED,
            null,
            { code: "CHAT_CREATE_FAILED" },
            500
        );
    }
}
