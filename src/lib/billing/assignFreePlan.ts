import prisma from "@/lib/prisma";

export async function assignFreePlan(userId: string) {
    const freePlan = await prisma.plan.findUnique({
        where: { name: "FREE" },
    });

    if (!freePlan) {
        throw new Error("FREE plan not found in database. Please run seed script.");
    }

    return await prisma.subscription.create({
        data: {
            userId,
            planId: freePlan.id,
            status: "ACTIVE",
            startedAt: new Date(),
            periodStart: new Date(),
            periodIntervalDays: 7, // Based on weekly interval in seed
            billingInterval: "weekly",
            tokensRemaining: freePlan.maxTokens ?? 5000,
        },
    });
}
