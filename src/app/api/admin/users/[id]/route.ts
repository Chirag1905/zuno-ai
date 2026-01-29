import prisma from "@/lib/prisma";
import { apiResponse } from "@/utils/apiResponse";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";

type Params = {
    params: Promise<{ id: string }>;
};

/* =========================
   GET — SINGLE USER
========================= */
export async function GET(_: Request, { params }: Params) {
    try {
        await requireSuperAdmin();

        const { id } = await params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                country: true,
                mfaEnabled: true,
                emailVerified: true,
                emailVerifiedAt: true,
                createdAt: true,
            },
        });

        if (!user) {
            return apiResponse(false, "User not found", null, null, 404);
        }

        return apiResponse(true, "User fetched", user);
    } catch (error) {
        console.error("[ADMIN_USERS_GET_BY_ID]", error);
        return apiResponse(false, "Failed to fetch user", null, error, 500);
    }
}

/* =========================
   PUT — UPDATE USER
========================= */
export async function PUT(req: Request, { params }: Params) {
    try {
        await requireSuperAdmin();

        const { id } = await params;
        const body = await req.json();

        const {
            name,
            role,
            country,
            mfaEnabled,
            emailVerified,
            password,
        } = body;

        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return apiResponse(false, "User not found", null, null, 404);
        }

        const updated = await prisma.user.update({
            where: { id },
            data: {
                name,
                role,
                country,
                mfaEnabled,
                emailVerified,
                emailVerifiedAt: emailVerified ? new Date() : null,
                password: password ? await hashPassword(password) : undefined,
            },
            select: {
                id: true,
                email: true,
                role: true,
                country: true,
                mfaEnabled: true,
                emailVerified: true,
                updatedAt: true,
            },
        });

        return apiResponse(true, "User updated", updated);
    } catch (error) {
        console.error("[ADMIN_USERS_PUT]", error);
        return apiResponse(false, "Failed to update user", null, error, 500);
    }
}

/* =========================
   DELETE — OPTIONAL (SOFT)
========================= */
export async function DELETE(_: Request, { params }: Params) {
    try {
        await requireSuperAdmin();
        const { id } = await params;

        await prisma.user.delete({
            where: { id },
        });

        return apiResponse(true, "User deleted");
    } catch (error) {
        console.error("[ADMIN_USERS_DELETE]", error);
        return apiResponse(false, "Failed to delete user", null, error, 500);
    }
}