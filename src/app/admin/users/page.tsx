import UserCSR from "@/app/admin/users/_components/userCSR";

interface PageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
        role?: "USER" | "ADMIN" | "SUPER_ADMIN";
    }>;
}

export default async function UserSSR({ searchParams }: PageProps) {
    const params = await searchParams;

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const search = params.search ?? "";
    const sortBy = params.sortBy ?? "createdAt";
    const sortOrder = params.sortOrder ?? "desc";
    const role = params.role;

    let result;

    try {
        const query = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            sortBy,
            sortOrder,
        });

        if (search) query.set("search", search);
        if (role) query.set("role", role);

        const res = await fetch(
            `${process.env.APP_URL}/api/admin/users?${query.toString()}`,
            { cache: "no-store" }
        );

        result = await res.json();
    } catch (error) {
        result = {
            success: false,
            status: 500,
            message: "Failed to load users",
            error: error instanceof Error ? error.message : "Unknown error",
            data: [],
            meta: {
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                },
            },
        };
    }

    return <UserCSR initialData={result} />;
}