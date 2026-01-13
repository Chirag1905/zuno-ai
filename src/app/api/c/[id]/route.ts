import { NextResponse } from "next/server";
import { formatZodError } from "@/utils/handleZodError";
import { apiResponse } from "@/utils/apiResponse";
import { IdSchema } from "@/app/api/c/validation";
import prisma from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const parsedId = IdSchema.safeParse({ id });
    if (!parsedId.success) {
        return apiResponse(
            false,
            "Invalid ID",
            null,
            formatZodError(parsedId.error),
            400.
        );
    }

    const chatId = parsedId.data.id;

    const messages = await prisma.chatMessage.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
}
