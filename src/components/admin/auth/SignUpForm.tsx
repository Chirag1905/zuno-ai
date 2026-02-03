"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authService } from "@/services/auth.api";

export default function SignUpForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!name || !email || !password) {
            setErrors({
                name: !name ? "Name is required" : "",
                email: !email ? "Email is required" : "",
                password: !password ? "Password is required" : "",
            });
            setLoading(false);
            return;
        }

        try {
            const registerPromise = authService.register({
                name,
                email,
                password,
            });

            await toast.promise(
                registerPromise,
                {
                    loading: "Creating admin account...",
                    success: (res) => res?.data?.message || "Admin account created successfully",
                    error: (err) => err?.response?.data?.message || "Failed to create account",
                },
                { duration: 5000 }
            );

            router.push("/admin/signin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">Create Admin Account</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Register for admin access
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <Input
                        name="name"
                        type="text"
                        placeholder="Admin Name"
                        errorMessage={errors.name}
                        disabled={loading}
                    />

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
                        allowPasswordGenerate
                    />

                    <Button
                        type="submit"
                        disabled={loading}
                        text={loading ? "Creating account..." : "Create Admin Account"}
                        textClassName="text-black"
                        className="w-full justify-center rounded-2xl bg-white/90 hover:bg-white py-3 font-medium disabled:opacity-60"
                    />
                </form>

                <p className="text-center text-sm text-gray-400">
                    Already have an admin account?{" "}
                    <Link href="/admin/signin" className="text-white hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
