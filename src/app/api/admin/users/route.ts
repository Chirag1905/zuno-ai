import prisma from "@/lib/prisma";
import { apiResponse } from "@/utils/apiResponse";
// import { requireSuperAdmin } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";
import { UserRole } from "@/generated/prisma/enums";
import { Prisma } from "@/generated/prisma/client";
import { requireSuperAdmin } from "@/lib/auth/guards";

/* =========================
   GET — LIST USERS
========================= */
export async function GET(req: Request) {
    try {
        await requireSuperAdmin();
        const { searchParams } = new URL(req.url);

        const page = Number(searchParams.get("page") ?? 1);
        const limit = Number(searchParams.get("limit") ?? 10);
        const search = searchParams.get("search") ?? "";
        const sortBy = searchParams.get("sortBy") ?? "createdAt";

        const sortOrder: Prisma.SortOrder =
            searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

        const roleParam = searchParams.get("role");

        const role =
            roleParam && Object.values(UserRole).includes(roleParam as UserRole)
                ? (roleParam as UserRole)
                : undefined;

        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {
            ...(role && { role }),
            ...(search && {
                OR: [
                    { email: { contains: search, mode: "insensitive" } },
                    { name: { contains: search, mode: "insensitive" } },
                ],
            }),
        };

        const allowedSortFields = ["createdAt", "name", "role", "country", "emailVerified", "mfaEnabled"] as const;
        type SortField = (typeof allowedSortFields)[number];

        const sortField = allowedSortFields.includes(sortBy as SortField)
            ? (sortBy as SortField)
            : "createdAt";

        const orderBy: Prisma.UserOrderByWithRelationInput = {
            [sortField]: sortOrder,
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    country: true,
                    image: true,
                    emailVerified: true,
                    emailVerifiedAt: true,
                    mfaEnabled: true,
                    createdAt: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        return apiResponse(true, "Users fetched", users, null, 200, {
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("[ADMIN_USERS_GET]", error);
        return apiResponse(false, "Failed to fetch users", null, error, 500);
    }
}

/* =========================
   POST — CREATE USER
========================= */
export async function POST(req: Request) {
    try {
        await requireSuperAdmin();

        const body = await req.json();
        const { name, email, password, role, country } = body;

        if (!email) {
            return apiResponse(false, "Email is required", null, null, 400);
        }

        const exists = await prisma.user.findUnique({
            where: { email },
        });

        if (exists) {
            return apiResponse(false, "User already exists", null, null, 409);
        }

        const user = await prisma.user.create({
            data: {
                name,
                email,
                country,
                role: role ?? "USER",
                password: password ? await hashPassword(password) : null,
                emailVerified: Boolean(password), // manual user = verified
                emailVerifiedAt: password ? new Date() : null,
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });

        return apiResponse(true, "User created", user);
    } catch (error) {
        console.error("[ADMIN_USERS_POST]", error);
        return apiResponse(false, "Failed to create user", null, error, 500);
    }
}