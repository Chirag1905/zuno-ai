"use client";

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";


import toast from "react-hot-toast";
import { Modal } from "antd";
import { userType } from "@/app/admin/users/_components/userType";
import CustomTable from "@/components/admin/ui/table/CustomTable";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";

const UserModal = dynamic(() => import("./userModal"), {
    ssr: false,
});


export default function UserCSR({ initialData }: { initialData: userType }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = initialData?.meta?.pagination?.page || 1;
    const limit = initialData?.meta?.pagination?.limit || 10;

    const [isModalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<userType | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    /* ======================================================
        🚀 Memoized URL update function
    ====================================================== */
    const updateURL = useCallback(
        (params: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) => {
            const newParams = new URLSearchParams(searchParams.toString());

            Object.entries(params).forEach(([key, value]) => {
                if (value === undefined) return;
                if (!value) newParams.delete(key);
                else newParams.set(key, String(value));
            });

            const query = newParams.toString();
            router.push(query ? `?${query}` : "?");
        },
        [searchParams, router]
    );

    /* ======================================================
        🔹 Memoized Column Definition (Prevents re-renders)
    ====================================================== */
    interface Column {
        key: keyof userType;
        label: string;
        render?: (value: unknown, row: userType, index: number) => React.ReactNode;
        className?: string;
    }

    const columns: Column[] = useMemo(
        () => [
            {
                key: "id",
                label: "Sr No",
                render: (_value: unknown, _row: userType, index: number) => (page - 1) * limit + index + 1,
                className: "w-20 whitespace-normal break-words",
            },
            { key: "name", label: "Name", className: "w-40 whitespace-normal break-words" },
            { key: "email", label: "Email", className: "w-fit whitespace-normal break-words" },
            { key: "role", label: "Role", className: "w-25 whitespace-normal break-words" },
        ],
        [page, limit]
    );

    /* ======================================================
        🔹 Pagination, Search, Sort Handlers (Memoized)
    ====================================================== */
    const handlePageChange = useCallback((page: number) => updateURL({ page, limit: 10 }), [updateURL]);

    const handleRowsPerPageChange = useCallback((limit: number) => updateURL({ page: 1, limit }), [updateURL]);

    const handleSearch = useCallback(
        (value: string) => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(() => updateURL({ page: 1, search: value }), 500);
        },
        [updateURL]
    );

    const handleSort = useCallback((sortBy: string, sortOrder: "asc" | "desc") => {
        updateURL({ sortBy, sortOrder });
    }, [updateURL]);

    /* ======================================================
        🔹 Modal Handlers
    ====================================================== */
    const handleAdd = () => {
        setEditData(null);
        setErrors({});
        setModalOpen(true);
    };

    const handleEdit = useCallback(
        async (id: string) => {
            const res = await fetch(`/api/users/${id}`);
            const result = await res.json();

            if (result.success) {
                setEditData(result.data);
                setErrors({});
                setModalOpen(true);
            }
        },
        []
    );

    /* ======================================================
        ❌ Delete Handler (Optimized)
    ====================================================== */
    const handleDelete = useCallback(
        (id: string) => {
            Modal.confirm({
                title: "Are you sure you want to delete?",
                content: "This action cannot be undone.",
                okText: "Yes, Delete",
                okType: "danger",
                cancelText: "Cancel",

                async onOk() {
                    const promise = (async () => {
                        const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
                        const result = await response.json();

                        if (!response.ok || !result.success) {
                            throw result?.message || "Delete failed";
                        }

                        updateURL({ page: 1, limit });
                        return result;
                    })();

                    toast.promise(promise, {
                        loading: "Deleting...",
                        success: "Deleted successfully!",
                        error: "Failed to delete!",
                    });

                    return promise;
                },
            });
        },
        [updateURL, limit]
    );

    /* ======================================================
        🔹 Submit Handler (Optimized & Cleaned)
    ====================================================== */
    const handleSubmit = useCallback(
        async (form: userType) => {
            const promise = (async () => {
                const url = form.id ? `/api/users/${form.id}` : `/api/users`;
                const method = form.id ? "PUT" : "POST";

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });

                const result = await res.json();

                // Validation
                if (result.status === 422 && result.error) {
                    const formatted: Record<string, string> = {};
                    for (const key in result.error) {
                        formatted[key] = result.error[key][0];
                    }
                    setErrors(formatted);
                    throw "validation-error";
                }

                if (!res.ok || !result.success) {
                    throw result.message || "Failed to save!";
                }

                setErrors({});
                setModalOpen(false);
                updateURL({ page: 1, limit });
                return result;
            })();

            toast.promise(promise, {
                loading: form.id ? "Updating..." : "Creating...",
                success: form.id ? "Updated successfully!" : "Created successfully!",
                error: () => "Something went wrong!",
            });

            return promise;
        },
        [updateURL, limit]
    );

    /* ======================================================
        🔹 Render
    ====================================================== */
    return (
        <>
            <PageBreadcrumb pageTitle="User Management" />

            <div className="space-y-6">
                <Suspense fallback={<div>Loading...</div>}>
                    {isModalOpen && (
                        <UserModal
                            isOpen={isModalOpen}
                            onClose={() => setModalOpen(false)}
                            onSubmit={handleSubmit}
                            initialData={editData}
                            errors={errors}
                        />
                    )}
                    {!isModalOpen && (
                        <CustomTable
                            title="User"
                            columns={columns}
                            copyableFields={["email"]}
                            paginatedData={initialData}
                            onAdd={handleAdd}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            onSearchChange={handleSearch}
                            onSort={handleSort}
                            enableSearch
                            sorting
                            filter
                        />
                    )}
                </Suspense>
            </div>
        </>
    );
}