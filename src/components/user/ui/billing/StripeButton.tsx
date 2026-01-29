"use client";

import { createStripeCheckout } from "@/lib/billing/billing";
import { useState } from "react";

export default function StripeButton({ plan }: { plan: any }) {
    const [loading, setLoading] = useState(false);

    async function handleStripe() {
        setLoading(true);
        const res = await createStripeCheckout(plan.id);
        window.location.href = res.data.url;
    }

    return (
        <button
            onClick={handleStripe}
            disabled={loading}
            className="w-full rounded-lg bg-black py-3 font-medium transition hover:opacity-90 disabled:opacity-50"
        >
            {loading ? "Redirecting..." : "Pay with Stripe"}
        </button>
    );
}
