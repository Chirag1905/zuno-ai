"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authService } from "@/services/auth.api";

export default function SignInForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email || !password) {
            setErrors({
                email: !email ? "Email is required" : "",
                password: !password ? "Password is required" : "",
            });
            setLoading(false);
            return;
        }

        try {
            const loginPromise = authService.login({
                email,
                password,
            });

            await toast.promise(
                loginPromise,
                {
                    loading: "Logging in...",
                    success: (res) => res?.data?.message || "Logged in successfully",
                    error: (err) => err?.response?.data?.message || "Invalid email or password",
                },
                { duration: 5000 }
            );

            router.push("/admin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">Admin Sign In</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Access the admin dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <Input
                        name="email"
                        type="email"
                        placeholder="Admin Email"
                        errorMessage={errors.email}
                        disabled={loading}
                    />

                    <Input
                        name="password"
                        type="password"
                        placeholder="Password"
                        errorMessage={errors.password}
                        disabled={loading}
                    />

                    <Button
                        type="submit"
                        disabled={loading}
                        text={loading ? "Signing in..." : "Sign In"}
                        textClassName="text-black"
                        className="w-full justify-center rounded-2xl bg-white/90 hover:bg-white py-3 font-medium disabled:opacity-60"
                    />
                </form>

                <p className="text-center text-sm text-gray-400">
                    Need an admin account?{" "}
                    <Link href="/admin/signup" className="text-white hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
