"use client";

import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [msg, setMsg] = useState("");

    async function submit() {
        const res = await authClient.forgotPassword({ email });
        if (res.error) setMsg(res.error.message);
        else setMsg("Check your email for reset link");
    }

    return (
        <>
            <input value={email} onChange={e => setEmail(e.target.value)} />
            <button onClick={submit}>Reset Password</button>
            {msg && <p>{msg}</p>}
        </>
    );
}