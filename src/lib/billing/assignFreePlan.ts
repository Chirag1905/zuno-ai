import prisma from "@/lib/prisma";

export async function assignFreePlan(userId: string) {
    const plan = await prisma.plan.findFirst({
        where: { isFree: true, isActive: true },
    });

    if (!plan) throw new Error("FREE plan missing");

    return prisma.subscription.create({
        data: {
            userId,
            planId: plan.id,
            status: "ACTIVE",

            startedAt: new Date(),
            endsAt: null,

            periodStart: new Date(),
            periodIntervalDays: 7,

            billingInterval: "weekly",
            tokensRemaining: plan.maxTokens!,
            provider: "SYSTEM",
        },
    });
}
