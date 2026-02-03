"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import AuthCard from "@/components/user/layout/AuthCard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authService } from "@/services/auth.api";

const ResetPasswordContent = () => {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get("token");

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!token) {
            router.replace("/signin");
        }
    }, [token, router]);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
            const resetPromise = authService.resetPassword({
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
        <AuthCard
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
                <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    errorMessage={errors.password}
                    disabled={loading}
                />
                <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    errorMessage={errors.confirmPassword}
                    disabled={loading}
                />
                <p className="text-xs text-neutral-400 text-center">
                    We’ll never share your password with anyone.
                </p>
                <Button
                    type="submit"
                    disabled={loading}
                    text={loading ? "Resetting..." : "Reset password"}
                    textClassName="text-black"
                    className="w-full justify-center rounded-2xl bg-white/90 hover:bg-white py-2 font-medium disabled:opacity-60"
                />
            </form>
        </AuthCard>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}