"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Icon, { IconName } from "@/components/ui/Icon";
import { authService } from "@/services/auth.api";

type Status = "loading" | "success" | "error";

const VerifyEmailContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const verifiedRef = useRef(false);

    const token = searchParams.get("token");

    const [status, setStatus] = useState<Status>("loading");
    const [message, setMessage] = useState("Verifying your email...");
    const [redirectIn, setRedirectIn] = useState<number | null>(null);

    /* ==================== VERIFY EMAIL ==================== */
    useEffect(() => {
        const verifyEmail = async () => {
            if (verifiedRef.current) return;
            verifiedRef.current = true;

            if (!token) {
                setStatus("error");
                setMessage("Invalid or expired verification link.");
                return;
            }

            try {
                const res = await authService.verifyEmail(token);

                if (!res?.data?.success) {
                    throw new Error(
                        res?.data?.message || "Email verification failed"
                    );
                }

                setStatus("success");
            } catch (error: any) {
                setStatus("error");
                setMessage(
                    error?.response?.data?.message ||
                    "Verification link expired or invalid"
                );
            }
        };

        verifyEmail();
    }, [token]);

    /* ==================== AUTO REDIRECT ==================== */
    useEffect(() => {
        if (status !== "success") return;

        setRedirectIn(10);

        const interval = setInterval(() => {
            setRedirectIn((prev) => {
                if (!prev || prev <= 1) {
                    clearInterval(interval);
                    router.push("/signin");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [status, router]);

    /* ==================== UI CONFIG ==================== */
    const UI: Record<
        Status,
        {
            icon: IconName;
            iconClass: string;
            title: string;
            description: string;
            badge?: string;
            action?: {
                label: string;
                icon: IconName;
                onClick: () => void;
                success?: boolean;
            };
        }
    > = {
        loading: {
            icon: "CircleDashed",
            iconClass: "text-purple-400 animate-spin",
            title: "Verifying Email",
            description: "Please do not close this window",
        },
        error: {
            icon: "CircleAlert",
            iconClass: "text-red-500",
            title: "Verification Failed!",
            description: message,
            action: {
                label: "Go to Sign In",
                icon: "ArrowLeft",
                onClick: () => router.push("/signin"),
            },
        },
        success: {
            icon: "CircleCheck",
            iconClass: "text-emerald-400",
            title: "Email Verified 🎉",
            description: "Your email has been successfully verified.",
            badge: "Secure verification completed",
            action: {
                label: "Continue to Sign In",
                icon: "CircleArrowRight",
                onClick: () => router.push("/signin"),
                success: true,
            },
        },
    };

    const current = UI[status];

    /* ==================== RENDER ==================== */
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-indigo-950 to-black text-white px-4">
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Glow */}
                <div className="absolute inset-0 bg-radial-gradient from-emerald-500/10 via-transparent to-transparent" />

                <div className="relative flex flex-col items-center text-center px-8 py-8 space-y-4">
                    {/* ICON */}
                    <div className="relative flex items-center justify-center h-20 w-20">
                        <div className="absolute inset-0 rounded-full bg-white/10 blur-xl" />
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/10 border border-white/20">
                            <Icon
                                name={current.icon}
                                size={50}
                                className={current.iconClass}
                            />
                        </div>
                    </div>

                    {/* TEXT */}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {current.title}
                        </h1>
                        <p className="text-sm text-neutral-400">
                            {current.description}
                        </p>
                    </div>

                    {/* BADGE */}
                    {current.badge && (
                        <div className="rounded-full bg-emerald-500/10 text-emerald-400 px-4 py-1 text-xs flex items-center gap-2">
                            <Icon name="ShieldCheck" size={14} />
                            <span>{current.badge}</span>
                        </div>
                    )}

                    {/* REDIRECT INFO */}
                    {status === "success" && redirectIn !== null && (
                        <p className="text-xs text-emerald-400/80">
                            Redirecting to sign in in{" "}
                            <span className="font-semibold">{redirectIn}</span>{" "}
                            seconds…
                        </p>
                    )}

                    {/* ACTION */}
                    {current.action && (
                        <Button
                            icon={current.action.icon}
                            text={current.action.label}
                            iconPosition={status === "error" ? "left" : "right"}
                            size="md"
                            onClick={current.action.onClick}
                            className={`w-full justify-center rounded-xl ${current.action.success
                                ? "bg-emerald-500! hover:bg-emerald-400!"
                                : "bg-white/10! hover:bg-white/20!"
                                }`}
                            textClassName={
                                current.action.success
                                    ? "text-black!"
                                    : "text-white!"
                            }
                            iconClassName={
                                current.action.success
                                    ? "text-black!"
                                    : "text-white!"
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}