"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import AuthLayout from "@/app/components/Layout/AuthLayout";
import InputField from "@/utils/InputField";
import SocialButtons from "@/utils/SocialButtons";
import api from "@/lib/axios";
import Link from "next/link";

export default function SignInPage() {
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
            const loginPromise = api.post("/auth/login", {
                email,
                password,
            });

            const { data } = await toast.promise(
                loginPromise,
                {
                    loading: "Logging in...",
                    success: (res) => {
                        if (res?.data?.data?.isTrusted) {
                            return res?.data?.message || "From Frontend OTP sent to your email";
                        }
                        return res?.data?.message || "From Frontend Logged in successfully";
                    },
                    error: (err) =>
                        err?.response?.data?.message ||
                        "From Frontend Invalid email or password",
                }
            );

            // 🔐 MFA flow
            if (data?.data?.isTrusted) {
                router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
                return;
            }

            // ✅ Normal login
            router.push("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your account"
            footer={
                <p className="text-center text-sm text-neutral-400">
                    Don’t have an account?{" "}
                    <Link href="/signup" className="text-white hover:underline">
                        SignUp
                    </Link>
                </p>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    {loading ? "Signing in..." : "Sign In"}
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
