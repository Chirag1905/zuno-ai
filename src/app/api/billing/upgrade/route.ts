import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guards";
import { apiResponse } from "@/types/apiResponse";

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

    const currentSub = await prisma.subscription.findFirst({
        where: { userId, status: "ACTIVE" },
        include: { plan: true },
    });

    if (!currentSub) {
        return apiResponse(false, "No active subscription", null, null, 400);
    }

    // 🚫 Prevent downgrade here
    if (
        currentSub.plan.maxTokens &&
        newPlan.maxTokens &&
        newPlan.maxTokens < currentSub.plan.maxTokens
    ) {
        return apiResponse(false, "Use downgrade API", null, null, 400);
    }

    // Expire old subscription
    await prisma.subscription.update({
        where: { id: currentSub.id },
        data: { status: "EXPIRED" },
    });

    // Create upgraded subscription
    const upgraded = await prisma.subscription.create({
        data: {
            userId,
            planId: newPlan.id,
            status: "ACTIVE",
            startedAt: new Date(),
            endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            provider: currentSub.provider,
            billingInterval: newPlan.interval,
            tokensRemaining: newPlan.maxTokens ?? 0,
            periodStart: new Date(),
            periodIntervalDays: newPlan.interval === "yearly" ? 365 : 30,
        },
    });

    return apiResponse(true, "Plan upgraded", upgraded);
}