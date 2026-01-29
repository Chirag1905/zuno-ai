"use client";

import { useEffect, useState } from "react";

export default function CurrentPlan() {
    const [sub, setSub] = useState<any>(null);

    useEffect(() => {
        fetch("/api/billing/subscription")
            .then((r) => r.json())
            .then((d) => setSub(d.data));
    }, []);

    if (!sub) return null;

    return (
        <div className="border rounded p-4">
            <h3 className="font-semibold">{sub.plan.name}</h3>
            <p>Tokens left: {sub.tokensRemaining}</p>
            <p>Status: {sub.status}</p>
        </div>
    );
}