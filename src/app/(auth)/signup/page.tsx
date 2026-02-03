


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { authService } from "@/services/auth.api";
import Link from "next/link";
import AuthCard from "@/components/user/layout/AuthCard";
import CountrySelect from "@/utils/CountrySelect";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SocialButtons from "@/utils/SocialButtons";

export default function SignUpPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const [country, setCountry] = useState<string | undefined>();
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
                country: country || undefined,
            });
            await toast.promise(
                registerPromise,
                {
                    loading: "Creating account...",
                    success: (res) => res?.data?.message || "Account created. Please verify your email.",
                    error: (err) =>
                        err?.response?.data?.message ||
                        "Failed to create account",
                }, { duration: 5000 }
            );

            router.push("/signin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
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
                <Input
                    name="name"
                    type="text"
                    placeholder="User Name"
                    errorMessage={errors.email}
                    disabled={loading}
                />
                <Input
                    name="email"
                    type="email"
                    placeholder="Email"
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

                <CountrySelect
                    value={country}
                    onChange={setCountry}
                    disabled={loading}
                />
                <Button
                    type="submit"
                    disabled={loading}
                    text={loading ? "Creating account..." : "Create Account"}
                    textClassName="text-black"
                    className="w-full justify-center rounded-2xl bg-white/90 hover:bg-white py-2 font-medium disabled:opacity-60"
                />
            </form>

            <Divider />

            <SocialButtons
                googleLoading={googleLoading}
                githubLoading={githubLoading}
                setGoogleLoading={setGoogleLoading}
                setGithubLoading={setGithubLoading}
            />
        </AuthCard>
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