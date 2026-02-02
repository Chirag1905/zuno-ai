import prisma from "@/lib/prisma";
import { apiResponse } from "@/types/apiResponse";

export async function GET() {
    const plans = await prisma.plan.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            price: true,
            currency: true,
            interval: true,
            isFree: true,
            maxChats: true,
            maxMessages: true,
            maxTokens: true,
        },
        orderBy: { price: "asc" },
    });

    const response = apiResponse(true, "Plans fetched", plans);
    response.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return response;
}