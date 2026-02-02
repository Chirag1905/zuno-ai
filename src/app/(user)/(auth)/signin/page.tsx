"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import Link from "next/link";
import AuthCard from "@/components/user/Layouts/AuthCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SocialButtons from "@/utils/SocialButtons";

export default function SignInPage() {
    const router = useRouter();
    const [emailValue, setEmailValue] = useState("");
    const [emailNotVerified, setEmailNotVerified] = useState(false);
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
                        setEmailNotVerified(false);
                        if (res?.data?.data?.isTrusted) {
                            return res?.data?.message || "OTP sent to your email";
                        }
                        return res?.data?.message || "Logged in successfully";
                    },
                    error: (err) => {
                        const code = err?.response?.data?.error?.code;
                        console.log("🚀 ~ handleSubmit ~ code:", code)

                        if (code === "EMAIL_NOT_VERIFIED") {
                            setEmailNotVerified(true);
                            return err?.response?.data?.message || "Email not verified. Please verify your email.";
                        }

                        setEmailNotVerified(false);
                        return err?.response?.data?.message || "Invalid email or password";
                    },
                },
                { duration: 5000 }
            );

            // 🔐 MFA flow
            if (data?.data?.isTrusted) {
                router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
                return;
            }

            // ✅ Normal login
            router.push("/");
        } finally {
            setLoading(false);
        }
    };

    const resendVerification = async () => {
        try {
            await toast.promise(
                api.post("/auth/verification/resend-verification", { email: emailValue }),
                {
                    loading: "Resending verification email...",
                    success: (res) => {
                        return res?.data?.message || "Verification email sent!";
                    },
                    error: (err) => {
                        return err?.response?.data?.message || "Failed to resend email";
                    },
                }
            );
        } catch { }
    };

    return (
        <AuthCard
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
                <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    errorMessage={errors.email}
                    disabled={loading}
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                />

                <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    errorMessage={errors.password}
                    disabled={loading}
                />

                {/* ✅ Forgot password link */}
                <div className="flex items-center justify-end gap-2">
                    {/* resend email button */}
                    {emailNotVerified && (
                        <Button
                            icon="RotateCw"
                            variant="outline"
                            size="xs"
                            text="Resend Email"
                            onClick={resendVerification}
                            type="button"
                            className="text-white"
                        />
                    )}
                    <Link
                        href="/forgotpassword"
                        className="text-sm text-white hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    text={loading ? "Signing in..." : "Sign In"}
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
