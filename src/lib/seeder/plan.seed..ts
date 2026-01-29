import prisma from "@/lib/prisma";

async function main() {
    console.log("🌱 Seeding plans...");

    await prisma.plan.upsert({
        where: { name: "FREE" },
        update: {},
        create: {
            name: "FREE",
            price: 0,
            currency: "INR",
            interval: "weekly",
            isFree: true,
            maxTokens: 5000,
            maxChats: 10,
            maxMessages: 100,
        },
    });

    await prisma.plan.upsert({
        where: { name: "PRO" },
        update: {},
        create: {
            name: "PRO",
            price: 19.99, // $19.99
            currency: "INR",
            interval: "monthly",
            maxTokens: 100000,
            maxChats: 100,
            maxMessages: 1000,
        },
    });

    await prisma.plan.upsert({
        where: { name: "PREMIUM" },
        update: {},
        create: {
            name: "PREMIUM",
            price: 49.99, // $49.99
            currency: "INR",
            interval: "monthly",
            maxTokens: 500000,
            maxChats: null,     // unlimited
            maxMessages: null,  // unlimited
        },
    });

    console.log("✅ Plans seeded");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());