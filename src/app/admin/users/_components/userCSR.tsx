"use client";

import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { userType } from "@/app/admin/users/_components/userType";
import CustomTable from "@/components/admin/ui/table/CustomTable";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { PaginatedResponse } from "@/types/api";
import ConfirmDialog from "@/components/user/ui/ConfirmDialog";

const UserModal = dynamic(() => import("./userModal"), {
    ssr: false,
});

interface Props {
    initialData: PaginatedResponse<userType>;
}

export default function UserCSR({ initialData }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = initialData?.meta?.pagination?.page ?? 1;
    const limit = initialData?.meta?.pagination?.limit ?? 10;

    const [isModalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<userType | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    /* ======================================================
        🚀 Memoized URL update function
    ====================================================== */
    const updateURL = useCallback(
        (params: Record<string, string | number | undefined>) => {
            const newParams = new URLSearchParams(searchParams.toString());

            Object.entries(params).forEach(([key, value]) => {
                if (value === undefined || value === "") {
                    newParams.delete(key);
                } else {
                    newParams.set(key, String(value));
                }
            });

            router.push(`?${newParams.toString()}`);
        },
        [router, searchParams]
    );

    /* =======================
       TABLE COLUMNS
    ======================= */
    const columns = useMemo(
        () => [
            {
                key: "__srNo",
                label: "Sr No",
                render: (_: unknown, __: userType, index: number) =>
                    (page - 1) * limit + index + 1,
            },
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "role", label: "Role" },
            { key: "country", label: "Country" },
            {
                key: "emailVerified",
                label: "Verified",
                render: (v: boolean) => (v ? "Yes" : "No"),
            },
            {
                key: "mfaEnabled",
                label: "MFA",
                render: (v: boolean) => (v ? "Enabled" : "Disabled"),
            },
            { key: "emailVerifiedAt", label: "Email Verified At" },
            { key: "createdAt", label: "Created At" },
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
            console.log("search calledk")
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(() => {
                updateURL({ page: 1, search: value });
            }, 400);
        },
        [updateURL]
    );

    const handleSort = useCallback(
        (sortBy: string, sortOrder: "asc" | "desc") => {
            const allowed = ["createdAt", "name", "role", "country", "emailVerified", "mfaEnabled"] as const;

            const isAllowedSortKey = (
                key: string
            ): key is (typeof allowed)[number] => {
                return (allowed as readonly string[]).includes(key);
            };

            if (isAllowedSortKey(sortBy)) {
                updateURL({ sortBy, sortOrder });
            }
        },
        [updateURL]
    );

    /* ======================================================
        🔹 Modal Handlers
    ====================================================== */
    const handleAdd = () => {
        setEditData(null);
        setErrors({});
        setModalOpen(true);
    };

    const handleEdit = useCallback(async (id: string) => {
        const res = await fetch(`/api/admin/users/${id}`);
        const result = await res.json();

        if (result.success) {
            setEditData(result.data);
            setErrors({});
            setModalOpen(true);
        }
    }, []);

    /* ======================================================
        ❌ Delete Handler (Optimized)
    ====================================================== */
    const handleDelete = useCallback((id: string) => {
        setUserToDelete(id);
        setConfirmOpen(true);
    }, []);

    const confirmDelete = async () => {
        if (!userToDelete) return;

        setDeleting(true);

        const promise = (async () => {
            const response = await fetch(`/api/admin/users/${userToDelete}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw result?.message || "Delete failed";
            }

            updateURL({ page: 1, limit });
            return result;
        })();

        try {
            await toast.promise(promise, {
                loading: "Deleting...",
                success: "Deleted successfully!",
                error: "Failed to delete!",
            });
        } finally {
            setDeleting(false);
            setConfirmOpen(false);
            setUserToDelete(null);
        }
    };

    /* ======================================================
        🔹 Submit Handler (Optimized & Cleaned)
    ====================================================== */
    const handleSubmit = useCallback(
        async (form: userType) => {
            const promise = (async () => {
                const isEdit = Boolean(form.id);

                const url = isEdit
                    ? `/api/admin/users/${form.id}`
                    : `/api/admin/users`;

                const method = isEdit ? "PUT" : "POST";

                // 🔹 Send only allowed fields
                const payload = {
                    name: form.name,
                    email: form.email,
                    role: form.role,
                    country: form.country,
                    mfaEnabled: form.mfaEnabled,
                    emailVerified: form.emailVerified,
                    password: form.password || undefined, // optional
                };

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                const result = await res.json();

                if (!res.ok || !result.success) {
                    throw result.message || "Failed to save user";
                }

                setErrors({});
                setModalOpen(false);
                updateURL({ page: 1, limit });
                return result;
            })();

            toast.promise(promise, {
                loading: form.id ? "Updating user..." : "Creating user...",
                success: form.id ? "User updated!" : "User created!",
                error: "Something went wrong!",
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
                        <>
                            <CustomTable<userType>
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
                            />
                            <ConfirmDialog
                                open={confirmOpen}
                                title="Delete user?"
                                description="This user will be permanently deleted. This action cannot be undone."
                                confirmText="Delete"
                                cancelText="Cancel"
                                loading={deleting}
                                onCancel={() => {
                                    setConfirmOpen(false);
                                    setUserToDelete(null);
                                }}
                                onConfirm={confirmDelete}
                            />
                        </>
                    )}
                </Suspense>
            </div>
        </>
    );
}