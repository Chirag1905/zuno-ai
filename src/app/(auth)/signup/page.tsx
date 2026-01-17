"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import AuthLayout from "@/app/components/Layout/AuthLayout";
import InputField from "@/utils/InputField";
import SocialButtons from "@/utils/SocialButtons";
import api from "@/lib/axios";
import Link from "next/link";

export default function SignUpPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
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
            const registerPromise = api.post("/auth/register", {
                name,
                email,
                password,
            });
            await toast.promise(
                registerPromise,
                {
                    loading: "Creating account...",
                    success: (res) => res?.data?.message || "From Frontend Account created. Please verify your email.",
                    error: (err) =>
                        err?.response?.data?.message ||
                        "From Frontend Failed to create account",
                }
            );

            router.push("/signin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start building today"
            footer={
                <p className="text-center text-sm text-neutral-400">
                    Already have an account?{" "}
                    <Link href="/signin" className="text-white hover:underline">
                        SignIn
                    </Link>
                </p>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                    name="name"
                    type="text"
                    placeholder="User Name"
                    error={errors.email}
                    disabled={loading}
                />
                <InputField
                    name="email"
                    type="email"
                    placeholder="Email"
                    error={errors.email}
                    disabled={loading}
                />

                <InputField
                    name="password"
                    type="password"
                    placeholder="Password"
                    error={errors.password}
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-white text-black py-2 font-medium disabled:opacity-60"
                >
                    {loading ? "Creating account..." : "Create Account"}
                </button>
            </form>

            <Divider />

            <SocialButtons
                googleLoading={googleLoading}
                githubLoading={githubLoading}
                setGoogleLoading={setGoogleLoading}
                setGithubLoading={setGithubLoading}
            />
        </AuthLayout>
    );
}

function Divider() {
    return (
        <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-800" />
            <span className="text-xs text-neutral-500">OR</span>
            <div className="h-px flex-1 bg-neutral-800" />
        </div>
    );
}