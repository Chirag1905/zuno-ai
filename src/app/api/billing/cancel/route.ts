import { requireAuth } from "@/lib/auth/guards";
import prisma from "@/lib/prisma";
import { apiResponse } from "@/utils/apiResponse";

export async function POST() {
    const { session } = await requireAuth();

    await prisma.subscription.updateMany({
        where: { userId: session.user.id, status: "ACTIVE" },
        data: { status: "CANCELED" },
    });

    return apiResponse(true, "Subscription will cancel at period end");
}