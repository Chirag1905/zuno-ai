"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailPage() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token");
    const [status, setStatus] = useState("Verifying...");

    useEffect(() => {
        if (!token) return;

        authClient.verifyEmail({ token }).then((res) => {
            if (res.error) {
                setStatus("Verification failed");
            } else {
                setStatus("Email verified! Redirecting...");
                setTimeout(() => router.push("/sign-in"), 1500);
            }
        });
    }, [token, router]);

    return <p>{status}</p>;
}