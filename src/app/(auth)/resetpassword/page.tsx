"use client";

import { authClient } from "@/lib/auth-client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPassword() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token");
    const [password, setPassword] = useState("");

    async function submit() {
        if (!token) return;

        const res = await authClient.resetPassword({
            token,
            password,
        });

        if (!res.error) {
            router.push("/sign-in");
        }
    }

    return (
        <>
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button onClick={submit}>Set New Password</button>
        </>
    );
}