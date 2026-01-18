"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import AuthLayout from "@/app/components/Layout/AuthLayout";
import Link from "next/link";
import InputField from "@/utils/InputField";

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get("token");

    const [loading, setLoading] = useState(false);
    console.log("🚀 ~ ResetPasswordPage ~ loading:", loading)
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!token) {
            router.replace("/signin");
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const password = formData.get("password") as string;
            const confirmPassword = formData.get("confirmPassword") as string;

            if (!password || !confirmPassword) {
                setErrors({
                    password: !password ? "Password is required" : "",
                    confirmPassword: !confirmPassword ? "Confirm Password is required" : "",
                });
                setLoading(false);
                return;
            }

            if (password.length < 8) {
                toast.error("Password must be at least 8 characters");
                return;
            }

            if (confirmPassword !== password) {
                toast.error("Passwords do not match");
                return;
            }
            const resetPromise = api.post("/auth/reset-password", {
                token,
                password,
            });

            await toast.promise(resetPromise, {
                loading: "Resetting password...",
                success: (res) => res?.data?.message || "Password reset successfully",
                error: (err) => err?.response?.data?.message || "Failed to reset password",
            }, { duration: 5000 });

            router.push("/signin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset password"
            subtitle="Enter your new password"
            footer={
                <p className="text-center text-sm text-neutral-400">
                    Remember your password?{" "}
                    <Link
                        href="/signin"
                        className="text-white hover:underline"
                    >
                        SignIn
                    </Link>
                </p>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                    name="password"
                    type="password"
                    placeholder="Password"
                    error={errors.password}
                    disabled={loading}
                />
                <InputField
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    error={errors.confirmPassword}
                    disabled={loading}
                />
                <p className="text-xs text-neutral-400 text-center">
                    We’ll never share your password with anyone.
                </p>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-white text-black py-2 font-medium disabled:opacity-60"
                >
                    {loading ? "Resetting..." : "Reset password"}
                </button>
            </form>
        </AuthLayout>
    );
}