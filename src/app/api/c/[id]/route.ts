import { formatZodError } from "@/utils/handleZodError";
import { apiResponse } from "@/utils/apiResponse";
import { IdSchema, UpdateChatSchema } from "@/app/api/c/validation";
import prisma from "@/lib/prisma";

/* ================= GET CHAT MESSAGES ================= */

export async function GET(
    req: Request,
    id: { params: Promise<{ id: string }> }
) {
    const idx = await id.params;
    const parsedId = IdSchema.safeParse(idx);

    if (!parsedId.success) {
        return apiResponse(
            false,
            "Invalid ID",
            null,
            formatZodError(parsedId.error),
            400
        );
    }

    const messages = await prisma.chatMessage.findMany({
        where: { chatId: parsedId.data.id },
        orderBy: { createdAt: "asc" },
    });

    return apiResponse(
        true,
        "Messages fetched successfully",
        { messages },
        null,
        200
    );
}

/* ================= UPDATE CHAT TITLE ================= */

export async function PATCH(
    req: Request,
    id: { params: Promise<{ id: string }> }
) {
    const idx = await id.params;
    const parsedId = IdSchema.safeParse(idx);

    if (!parsedId.success) {
        return apiResponse(
            false,
            "Invalid ID",
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

    const chat = await prisma.chat.update({
        where: { id: parsedId.data.id },
        data: { title: parsedBody.data.title },
    });

    return apiResponse(
        true,
        "Chat updated successfully",
        chat,
        null,
        200
    );
}

/* ================= DELETE CHAT ================= */

export async function DELETE(
    req: Request,
    id: { params: Promise<{ id: string }> }
) {
    const idx = await id.params;
    const parsedId = IdSchema.safeParse(idx);

    if (!parsedId.success) {
        return apiResponse(
            false,
            "Invalid ID",
            null,
            formatZodError(parsedId.error),
            400
        );
    }

    const chatId = parsedId.data.id;

    await prisma.chatMessage.deleteMany({
        where: { chatId },
    });

    await prisma.chat.delete({
        where: { id: chatId },
    });

    return apiResponse(
        true,
        "Chat deleted successfully",
        null,
        null,
        200
    );
}


// import { NextResponse } from "next/server";
// import { formatZodError } from "@/utils/handleZodError";
// import { apiResponse } from "@/utils/apiResponse";
// import { IdSchema, UpdateChatSchema } from "@/app/api/c/validation";
// import prisma from "@/lib/prisma";

// /* ================= GET CHAT MESSAGES ================= */

// export async function GET(
//     req: Request,
//     id: { params: Promise<{ id: string }> }
// ) {
//     const idx = await id.params;
//     const parsedId = IdSchema.safeParse(idx);
//     if (!parsedId.success) {
//         return apiResponse(
//             false,
//             "Invalid ID",
//             null,
//             formatZodError(parsedId.error),
//             400
//         );
//     }

//     const messages = await prisma.chatMessage.findMany({
//         where: { chatId: parsedId.data.id },
//         orderBy: { createdAt: "asc" },
//     });

//     return NextResponse.json({ messages });
// }

// /* ================= UPDATE CHAT TITLE ================= */

// export async function PATCH(
//     req: Request,
//     id: { params: Promise<{ id: string }> }
// ) {
//     const idx = await id.params;
//     const parsedId = IdSchema.safeParse(idx);
//     if (!parsedId.success) {
//         return apiResponse(
//             false,
//             "Invalid ID",
//             null,
//             formatZodError(parsedId.error),
//             400
//         );
//     }

//     const body = await req.json();
//     const parsedBody = UpdateChatSchema.safeParse(body);

//     if (!parsedBody.success) {
//         return apiResponse(
//             false,
//             "Invalid payload",
//             null,
//             formatZodError(parsedBody.error),
//             400
//         );
//     }

//     const chat = await prisma.chat.update({
//         where: { id: parsedId.data.id },
//         data: { title: parsedBody.data.title },
//     });

//     return apiResponse(true, "Chat updated", chat, null, 200);
// }

// /* ================= DELETE CHAT ================= */

// export async function DELETE(
//     req: Request,
//     id: { params: Promise<{ id: string }> }
// ) {
//     const idx = await id.params;
//     const parsedId = IdSchema.safeParse(idx);
//     if (!parsedId.success) {
//         return apiResponse(
//             false,
//             "Invalid ID",
//             null,
//             formatZodError(parsedId.error),
//             400
//         );
//     }

//     const chatId = parsedId.data.id;

//     // delete messages first (safe if no cascade)
//     await prisma.chatMessage.deleteMany({
//         where: { chatId },
//     });

//     await prisma.chat.delete({
//         where: { id: chatId },
//     });

//     return apiResponse(true, "Chat deleted", null, null, 200);
// }
