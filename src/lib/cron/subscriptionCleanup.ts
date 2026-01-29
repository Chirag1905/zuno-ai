import prisma from "@/lib/prisma";

export async function expireSubscriptions() {
    await prisma.subscription.updateMany({
        where: {
            status: "ACTIVE",
            endsAt: { lt: new Date() },
        },
        data: { status: "EXPIRED" },
    });
}