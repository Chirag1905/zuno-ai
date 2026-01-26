import { userType } from "./_components/userType";
import UserCSR from "./_components/userCSR";
import { UserResponse } from "@/types/user";

interface PageProps {
    searchParams: Promise<{
        page?: string;
        limit?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
    }>;
}

export default async function UserSSR({ searchParams }: PageProps) {

    const params = await searchParams;
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const search = params.search || "";
    const sortBy = params.sortBy || undefined;
    const sortOrder = params.sortOrder || undefined;

    try {
        const query = new URLSearchParams();
        query.set("page", String(page));
        query.set("limit", String(limit));
        if (search) query.set("search", search);
        if (sortBy) query.set("sortBy", sortBy);
        if (sortOrder) query.set("sortOrder", sortOrder);

        const res = await fetch(
            `http://localhost:3000/api/users?${query.toString()}`,
            { cache: "no-store" }
        );

        if (!res.ok) {
            throw new Error("Failed to fetch subadmins");
        }

        const result: UserResponse<userType> = await res.json();
        return <UserCSR initialData={result} />;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred.';
        console.log("🚀 ~ SSR ~ message:", message);
        return (
            <UserCSR
                initialData={{
                    data: [],
                    meta: {
                        pagination: {
                            page: page,
                            totalPages: 0,
                            totalItems: 0,
                            limit: limit,
                            hasNextPage: false,
                            hasPrevPage: false,
                        },
                    },
                    error: message,
                    message: "No data found.",
                    status: 404,
                    success: false,
                }}
            />
        );
    }
}