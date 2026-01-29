import prisma from "@/lib/prisma";
import { apiResponse } from "@/utils/apiResponse";

export async function GET() {
    const plans = await prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
    });

    return apiResponse(true, "Plans fetched", plans);
}