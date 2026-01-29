import prisma from "@/lib/prisma";

export async function getActiveSubscription(userId: string) {
    const sub = await prisma.subscription.findFirst({
        where: {
            userId,
            status: "ACTIVE",
        },
        include: { plan: true },
    });

    if (!sub) return null;

    const now = Date.now();
    const nextReset =
        sub.periodStart.getTime() +
        sub.periodIntervalDays * 24 * 60 * 60 * 1000;

    if (now >= nextReset) {
        const updated = await prisma.subscription.update({
            where: { id: sub.id },
            data: {
                periodStart: new Date(),
                tokensRemaining: sub.plan.maxTokens!,
            },
        });

        return { ...updated, plan: sub.plan };
    }

    return sub;
}
