"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import Icon from "@/app/components/ui/Icon";

export default function VerifyEmailPage() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token");
    const [verified, setVerified] = useState(false);

    // simulate verification
    useEffect(() => {
        const timer = setTimeout(() => {
            setVerified(true);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid verification link");
            return;
        }

        api.post("/auth/verify-email", { token })
            .then((res) => {
                toast.success(res.data.message || "Email verified successfully");
                router.push("/signin");
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.message ||
                    "Verification link expired or invalid"
                );
            });
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-neutral-900 to-black text-white px-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center text-center px-8 py-10 space-y-6">

                    {/* Spinner / Tick */}
                    <div className="relative flex items-center justify-center h-16 w-16">
                        {!verified ? (
                            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/20 animate-scale-in">
                                <Icon name="CircleDashed" className="text-emerald-400 animate-spin" size={50} />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-500 animate-scale-in">
                                <Icon name="CircleCheck" className="text-emerald-400" size={50} />
                            </div>
                        )}
                    </div>

                    {/* Text */}
                    <div className="space-y-2 transition-all duration-300">
                        <h1 className="text-xl font-semibold tracking-tight">
                            {verified ? "Email verified" : "Verifying your email"}
                        </h1>
                        <p className="text-sm text-neutral-400 leading-relaxed">
                            {verified
                                ? "Your account has been successfully verified."
                                : "Please wait a moment while we securely verify your account."}
                        </p>
                    </div>

                    {/* Status badge */}
                    <div
                        className={`rounded-full px-4 py-1 text-xs transition-all duration-300 ${verified
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-white/10 text-neutral-300"
                            }`}
                    >
                        {verified ? (
                            <span className="flex items-center p-2 space-x-2">
                                <Icon name="ShieldCheck" className="text-emerald-400" size={20} />
                                <p>Verification complete</p>
                            </span>
                        ) : (
                            <span className="flex items-center p-2 space-x-2">
                                <Icon name="ShieldCheck" className="text-emerald-400" size={20} />
                                <p>Secure verification in progress</p>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
        // <div className="min-h-screen flex items-center justify-center text-white">
        //     <div className="text-center space-y-3">
        //         <h1 className="text-xl font-semibold">Verifying your email…</h1>
        //         <p className="text-neutral-400">
        //             Please wait while we verify your account.
        //         </p>
        //     </div>
        // </div>
    );
}