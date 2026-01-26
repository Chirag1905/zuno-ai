// api/admin/users/route.ts
import { requireSuperAdmin } from "@/lib/auth/guards";
import prisma from "@/lib/prisma";

export async function GET() {
    // await requireSuperAdmin();

    return Response.json(
        await prisma.user.findMany()
    );
}