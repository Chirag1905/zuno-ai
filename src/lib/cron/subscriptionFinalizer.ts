import prisma from "@/lib/prisma";

export async function finalizeSubscriptions() {
    const expired = await prisma.subscription.findMany({
        where: {
            status: "CANCELED",
            endsAt: { lt: new Date() },
        },
    });

    for (const sub of expired) {
        await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: "EXPIRED" },
        });

        // Assign FREE
        // reuse assignFreePlan(sub.userId)
    }
}