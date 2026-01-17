"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import Icon from "@/app/components/ui/Icon";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token");

    const [status, setStatus] = useState<Status>("loading");

    useEffect(() => {
        if (!token) {
            toast.error("Invalid verification link");
            setStatus("error");
            return;
        }

        let cancelled = false;

        api.post("/auth/verify-email", { token })
            .then((res) => {
                if (cancelled) return;
                toast.success(res.data.message || "Email verified successfully");
                setStatus("success");

                // small UX delay before redirect
                setTimeout(() => router.push("/signin"), 1500);
            })
            .catch((err) => {
                if (cancelled) return;
                toast.error(
                    err?.response?.data?.message ||
                    "Verification link expired or invalid"
                );
                setStatus("error");
            });

        return () => {
            cancelled = true;
        };
    }, [token, router]);

    const isLoading = status === "loading";
    const isSuccess = status === "success";

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-neutral-900 to-black text-white px-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center text-center px-8 py-10 space-y-6">

                    {/* Spinner / Tick */}
                    <div className="relative flex items-center justify-center h-16 w-16">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/20 animate-scale-in">
                                <Icon
                                    name="CircleDashed"
                                    className="text-emerald-400 animate-spin"
                                    size={50}
                                />
                            </div>
                        ) : isSuccess ? (
                            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-500 animate-scale-in">
                                <Icon
                                    name="CircleCheck"
                                    className="text-emerald-400"
                                    size={50}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-red-500/20 border border-red-500 animate-scale-in">
                                <Icon
                                    name="CircleX"
                                    className="text-red-400"
                                    size={50}
                                />
                            </div>
                        )}
                    </div>

                    {/* Text */}
                    <div className="space-y-2 transition-all duration-300">
                        <h1 className="text-xl font-semibold tracking-tight">
                            {isLoading
                                ? "Verifying your email"
                                : isSuccess
                                    ? "Email verified"
                                    : "Verification failed"}
                        </h1>

                        <p className="text-sm text-neutral-400 leading-relaxed">
                            {isLoading
                                ? "Please wait a moment while we securely verify your account."
                                : isSuccess
                                    ? "Your account has been successfully verified."
                                    : "This verification link is invalid or expired."}
                        </p>
                    </div>

                    {/* Status badge */}
                    <div
                        className={`rounded-full px-4 py-1 text-xs transition-all duration-300 ${isSuccess
                            ? "bg-emerald-500/10 text-emerald-400"
                            : isLoading
                                ? "bg-white/10 text-neutral-300"
                                : "bg-red-500/10 text-red-400"
                            }`}
                    >
                        <span className="flex items-center p-2 space-x-2">
                            <Icon name="ShieldCheck" size={18} />
                            <p>
                                {isLoading
                                    ? "Secure verification in progress"
                                    : isSuccess
                                        ? "Verification complete"
                                        : "Verification failed"}
                            </p>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
