import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guards";
import { apiResponse } from "@/utils/apiResponse";

export async function POST(req: Request) {
    const { session } = await requireAuth();
    const userId = session.user.id;
    const { newPlanId } = await req.json();

    const newPlan = await prisma.plan.findUnique({
        where: { id: newPlanId, isActive: true },
    });

    if (!newPlan) {
        return apiResponse(false, "Invalid plan", null, null, 400);
    }

    const sub = await prisma.subscription.findFirst({
        where: { userId, status: "ACTIVE" },
        include: { plan: true },
    });

    if (!sub) {
        return apiResponse(false, "No active subscription", null, null, 400);
    }

    // Schedule downgrade
    await prisma.subscription.update({
        where: { id: sub.id },
        data: {
            status: "CANCELED",
        },
    });

    // Create future subscription
    const periodIntervalDays = newPlan.interval === "yearly" ? 365 : 30;

    await prisma.subscription.create({
        data: {
            userId,
            planId: newPlan.id,
            status: "ACTIVE",
            startedAt: sub.endsAt!,
            periodStart: sub.endsAt!,
            periodIntervalDays,
            provider: "SYSTEM",
            billingInterval: newPlan.interval,
            tokensRemaining: newPlan.maxTokens ?? 0,
        },
    });

    return apiResponse(true, "Downgrade scheduled");
}