import { formatZodError } from "@/utils/handleZodError";
import { apiResponse } from "@/utils/apiResponse";
import { IdSchema, UpdateChatSchema } from "@/app/api/c/validation";
import prisma from "@/lib/prisma";
import { CHAT_ERROR_MESSAGES } from "@/lib/errors/chat.error";
import { AUTH_ERROR_MESSAGES, AuthError } from "@/lib/errors/auth.error";
import { requireAuth } from "@/lib/auth/guards";

/* ================= GET CHAT MESSAGES ================= */

export async function GET(
    req: Request,
    id: { params: Promise<{ id: string }> }
) {
    try {
        const { session } = await requireAuth();
        const idx = await id.params;
        const parsedId = IdSchema.safeParse(idx);

        if (!parsedId.success) {
            return apiResponse(
                false,
                CHAT_ERROR_MESSAGES.INVALID_CHAT_ID,
                null,
                formatZodError(parsedId.error),
                400
            );
        }
        const chat = await prisma.chat.findFirst({
            where: {
                id: parsedId.data.id,
                userId: session.user.id,
            },
        });

        if (!chat) {
            return apiResponse(
                false,
                CHAT_ERROR_MESSAGES.CHAT_NOT_FOUND,
                null,
                { code: "CHAT_NOT_FOUND" },
                404
            );
        }

        const messages = await prisma.chatMessage.findMany({
            where: { chatId: chat.id },
            orderBy: { createdAt: "asc" },
        });

        return apiResponse(true, "Messages fetched successfully", { messages }, null, 200);
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

        console.error("[GET_MESSAGES_ERROR]", e);

        return apiResponse(
            false,
            CHAT_ERROR_MESSAGES.CHAT_INTERNAL,
            null,
            { code: "CHAT_INTERNAL" },
            500
        );
    }
}

/* ================= UPDATE CHAT TITLE ================= */

export async function PATCH(
    req: Request,
    id: { params: Promise<{ id: string }> }
) {
    try {
        const { session } = await requireAuth();
        const idx = await id.params;
        const parsedId = IdSchema.safeParse(idx);

        if (!parsedId.success) {
            return apiResponse(
                false,
                CHAT_ERROR_MESSAGES.INVALID_CHAT_ID,
                null,
                formatZodError(parsedId.error),
                400
            );
        }

        const body = await req.json();
        const parsedBody = UpdateChatSchema.safeParse(body);

        if (!parsedBody.success) {
            return apiResponse(
                false,
                "Invalid payload",
                null,
                formatZodError(parsedBody.error),
                400
            );
        }


        const chat = await prisma.chat.findFirst({
            where: {
                id: parsedId.data.id,
                userId: session.user.id,
            },
        });

        if (!chat) {
            return apiResponse(
                false,
                CHAT_ERROR_MESSAGES.CHAT_NOT_FOUND,
                null,
                { code: "CHAT_NOT_FOUND" },
                404
            );
        }

        const updatedChat = await prisma.chat.update({
            where: { id: chat.id },
            data: { title: parsedBody.data.title },
        });

        return apiResponse(true, "Chat updated successfully", updatedChat, null, 200);
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

        console.error("[UPDATE_CHAT_ERROR]", e);

        return apiResponse(
            false,
            CHAT_ERROR_MESSAGES.CHAT_UPDATE_FAILED,
            null,
            { code: "CHAT_UPDATE_FAILED" },
            500
        );
    }
}

/* ================= DELETE CHAT ================= */

export async function DELETE(
    req: Request,
    id: { params: Promise<{ id: string }> }
) {
    try {
        const { session } = await requireAuth();

        const idx = await id.params;
        const parsedId = IdSchema.safeParse(idx);

        if (!parsedId.success) {
            return apiResponse(
                false,
                CHAT_ERROR_MESSAGES.INVALID_CHAT_ID,
                null,
                formatZodError(parsedId.error),
                400
            );
        }

        const chat = await prisma.chat.findFirst({
            where: {
                id: parsedId.data.id,
                userId: session.user.id,
            },
        });

        if (!chat) {
            return apiResponse(
                false,
                CHAT_ERROR_MESSAGES.CHAT_NOT_FOUND,
                null,
                { code: "CHAT_NOT_FOUND" },
                404
            );
        }

        await prisma.chatMessage.deleteMany({
            where: { chatId: chat.id },
        });

        await prisma.chat.delete({
            where: { id: chat.id },
        });

        return apiResponse(true, "Chat deleted successfully", null, null, 200);
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

        console.error("[DELETE_CHAT_ERROR]", e);

        return apiResponse(
            false,
            CHAT_ERROR_MESSAGES.CHAT_DELETE_FAILED,
            null,
            { code: "CHAT_DELETE_FAILED" },
            500
        );
    }
}