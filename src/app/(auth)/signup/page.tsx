"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";

import AuthLayout from "@/app/components/Layout/AuthLayout";
import InputField from "@/app/utils/InputField";
import SocialButtons from "@/app/utils/SocialButtons";

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
        const res = await authClient.signUp.email({
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        });

        setLoading(false);

        if (res.error) {
            toast.error(res.error.message || "Signup failed");
            return;
        }

        toast.success("Account created successfully");
        router.push("/dashboard");
    }

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your account"
            footer={
                <p className="text-center text-sm text-neutral-400">
                    Already have an account?{" "}
                    <a href="/signin" className="text-white hover:underline">
                        SignIn
                    </a>
                </p>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                    name="name"
                    type="text"
                    placeholder="Email"
                    error={errors.email}
                    disabled={loading}
                    required
                />
                <InputField
                    name="email"
                    type="email"
                    placeholder="Email"
                    error={errors.email}
                    disabled={loading}
                    required
                />

                <InputField
                    name="password"
                    type="password"
                    placeholder="Password"
                    error={errors.password}
                    disabled={loading}
                    required
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