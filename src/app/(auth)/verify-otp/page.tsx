"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import AuthLayout from "@/app/components/Layout/AuthLayout";
import api from "@/lib/axios";

/* ================= DEVICE NAME ================= */

function getDeviceName() {
    if (typeof navigator === "undefined") return "Unknown Device";

    const ua = navigator.userAgent;

    const browser =
        ua.includes("Chrome") && !ua.includes("Edg")
            ? "Chrome"
            : ua.includes("Firefox")
                ? "Firefox"
                : ua.includes("Safari") && !ua.includes("Chrome")
                    ? "Safari"
                    : ua.includes("Edg")
                        ? "Edge"
                        : "Unknown Browser";

    const os =
        ua.includes("Windows")
            ? "Windows"
            : ua.includes("Mac")
                ? "Mac"
                : ua.includes("Android")
                    ? "Android"
                    : ua.includes("iPhone")
                        ? "iPhone"
                        : "Unknown OS";

    return `${browser} on ${os}`;
}

/* ================= OTP INPUT ================= */

function OtpInput({
    value,
    onChange,
    shake,
}: {
    value: string;
    onChange: (val: string) => void;
    shake: boolean;
}) {
    const inputsRef = useRef<HTMLInputElement[]>([]);

    const handleChange = (i: number, v: string) => {
        if (!/^\d*$/.test(v)) return;

        const digits = v.split("");
        const next = value.split("");

        digits.forEach((d, idx) => {
            if (i + idx < 6) next[i + idx] = d;
        });

        onChange(next.join("").slice(0, 6));

        const nextIndex = Math.min(i + digits.length, 5);
        inputsRef.current[nextIndex]?.focus();
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !value[i] && i > 0) {
            inputsRef.current[i - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const paste = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);
        onChange(paste);
        inputsRef.current[paste.length - 1]?.focus();
    };

    return (
        <div
            className={`flex gap-2 justify-center ${shake ? "animate-shake" : ""
                }`}
            onPaste={handlePaste}
        >
            {Array.from({ length: 6 }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        if (el) inputsRef.current[i] = el;
                    }}
                    value={value[i] || ""}
                    onChange={(e) =>
                        handleChange(i, e.target.value)
                    }
                    onKeyDown={(e) =>
                        handleKeyDown(i, e)
                    }
                    maxLength={1}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="w-10 h-12 rounded-xl bg-neutral-900 text-white text-lg text-center outline-none focus:ring-2 focus:ring-white"
                />
            ))}
        </div>
    );
}

/* ================= PAGE ================= */

export default function VerifyOtpPage() {
    const router = useRouter();
    const params = useSearchParams();
    const email = params.get("email");

    const [otp, setOtp] = useState("");
    const [rememberDevice, setRememberDevice] = useState(false);
    const [deviceName, setDeviceName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);
    const [shake, setShake] = useState(false);

    useEffect(() => {
        setDeviceName(getDeviceName());
    }, []);

    /* ================= VERIFY OTP ================= */

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        setError(null);

        if (otp.length !== 6) {
            triggerError("Enter 6-digit OTP");
            return;
        }

        setLoading(true);

        try {
            const otpPromise = api.post("/auth/mfa/verify", {
                email,
                otp,
                rememberDevice,
                deviceName,
            });

            await toast.promise(otpPromise, {
                loading: "Verifying OTP...",
                success: (res) =>
                    res?.data?.message || "OTP verified",
                error: (err) =>
                    err?.response?.data?.message ||
                    "Invalid or expired OTP",
            }, { duration: 5000 });
            router.push("/");
        } catch (err: any) {
            triggerError(
                err?.response?.data?.message ||
                "Invalid or expired OTP"
            );
        } finally {
            setLoading(false);
        }
    };

    const triggerError = (msg: string) => {
        setError(msg);
        setShake(true);
        setTimeout(() => setShake(false), 400);
    };

    /* ================= RESEND OTP ================= */

    const resendOtp = async () => {
        if (!email || cooldown > 0) return;

        try {
            await api.post("/auth/mfa/resend", { email });
            toast.success("OTP resent");
            setCooldown(30);
        } catch {
            toast.error("Failed to resend OTP");
        }
    };

    /* ================= COOLDOWN ================= */

    useEffect(() => {
        if (cooldown <= 0) return;

        const timer = setInterval(() => {
            setCooldown((c) => c - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    /* ================= UI ================= */

    return (
        <AuthLayout
            title="Verify OTP"
            subtitle={`Enter the OTP sent to ${email}`}
            footer={
                <p className="text-center text-sm text-neutral-400">
                    Didn’t receive the code?{" "}
                    <button
                        type="button"
                        disabled={cooldown > 0}
                        onClick={resendOtp}
                        className="text-white hover:underline disabled:opacity-50"
                    >
                        {cooldown > 0
                            ? `Resend OTP in ${cooldown}s`
                            : "Resend OTP"}
                    </button>
                </p>
            }
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >
                <OtpInput
                    value={otp}
                    onChange={setOtp}
                    shake={shake}
                />

                {error && (
                    <p className="text-center text-sm text-red-500">
                        {error}
                    </p>
                )}

                <label className="flex items-center gap-2 text-sm text-neutral-400 justify-center">
                    <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) =>
                            setRememberDevice(
                                e.target.checked
                            )
                        }
                        disabled={loading}
                        className="accent-white"
                    />
                    Remember this device
                </label>

                <p className="text-center text-xs text-neutral-500">
                    Device: {deviceName}
                </p>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full justify-center rounded-3xl bg-white text-black py-2 font-medium disabled:opacity-60"
                >
                    {loading
                        ? "Verifying..."
                        : "Verify OTP"}
                </button>
            </form>
        </AuthLayout>
    );
}