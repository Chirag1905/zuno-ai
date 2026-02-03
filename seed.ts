import { spawn } from "bun";

async function runSeed(scriptPath: string) {
    console.log(`\n🌱 Running seed: ${scriptPath}...`);

    const proc = spawn(["bun", scriptPath], {
        stdout: "inherit",
        stderr: "inherit",
    });

    const exitCode = await proc.exited;

    if (exitCode !== 0) {
        console.error(`❌ Seed failed: ${scriptPath}`);
        process.exit(exitCode);
    }

    console.log(`✅ Seed completed: ${scriptPath}`);
}

async function main() {
    console.log("🚀 Starting database seeding...");

    try {
        // Seed Plans first
        await runSeed("src/lib/seeder/plan.seed.ts");

        // Seed Super Admin
        await runSeed("src/lib/seeder/superAdmin.seed.ts");

        console.log("\n✨ All seeds executed successfully!");
    } catch (error) {
        console.error("\n❌ Seeding process encountered an error:", error);
        process.exit(1);
    }
}

main();
