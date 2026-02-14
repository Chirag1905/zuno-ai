import { UserRole } from "@/generated/prisma/enums";
import prisma from "@/lib/prisma";
import argon2 from "argon2";

async function seedSuperAdmin() {
    const SUPER_ADMIN_EMAIL =  process.env.SUPER_ADMIN_EMAIL || "owner@zuno.ai";
    const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "ChangeThisStrongPassword123!";

    const existingAdmin = await prisma.user.findUnique({
        where: { email: SUPER_ADMIN_EMAIL },
    });

    if (existingAdmin) {
        console.log("✅ Super Admin already exists");
        return;
    }

    const hashedPassword = await argon2.hash(SUPER_ADMIN_PASSWORD, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64MB
        timeCost: 3,
        parallelism: 1,
    });

    await prisma.user.create({
        data: {
            name: "Zuno AI Owner",
            email: SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            role: UserRole.SUPER_ADMIN,

            emailVerified: true,
            emailVerifiedAt: new Date(),
            mfaEnabled: false,
            country: "India",

            image: "https://zuno.ai/logo.png",
        },
    });

    console.log("🚀 Super Admin (Owner) seeded successfully");
}

async function main() {
    console.log("🌱 Seeding database...");
    await seedSuperAdmin();
    console.log("🌱 Seeding completed");
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });