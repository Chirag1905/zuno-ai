"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import InputField from "@/utils/InputField";
import Link from "next/link";
import AuthCard from "@/components/user/Layouts/AuthCard";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;

        if (!email) {
            setErrors({ email: "Email is required" });
            setLoading(false);
            return;
        }

        try {
            const forgotPromise = api.post("/auth/forgot-password", { email });
            await toast.promise(forgotPromise, {
                loading: "Sending reset link...",
                success: (res) => res?.data?.message || "Reset link sent successfully",
                error: (err) => err?.response?.data?.message || "Failed to send reset link",
            }, { duration: 5000 });

            router.push("/signin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            title="Forgot password"
            subtitle="Enter your email address and we’ll send you a reset link"
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
            <form onSubmit={handleSubmit} className="space-y-5">
                <InputField
                    name="email"
                    type="email"
                    placeholder="Email address"
                    error={errors.email}
                    disabled={loading}
                />
                <p className="text-xs text-neutral-400 text-center">
                    We’ll never share your email with anyone.
                </p>
                <button
                    type="submit"
                    disabled={loading}
                    className="
                        w-full rounded-2xl
                        bg-white text-black
                        py-2.5 font-medium
                        transition
                        hover:opacity-90
                        disabled:opacity-60
                    "
                >
                    {loading ? "Sending..." : "Send reset link"}
                </button>
            </form>
        </AuthCard>
    );
}