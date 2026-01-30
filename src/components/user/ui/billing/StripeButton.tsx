"use client";

import { useState } from "react";
import { createStripeCheckout } from "@/lib/billing/billing";
import { IconButton } from "@/components/user/ui/Icon";

interface StripeButtonProps {
    plan: {
        id: string;
        name: string;
    };
    className?: string;
}

export default function StripeButton({
    plan,
    className = "",
}: StripeButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleStripe() {
        if (loading) return;

        try {
            setLoading(true);
            const res = await createStripeCheckout(plan.id);

            if (!res?.data?.url) {
                throw new Error("Stripe checkout URL missing");
            }

            window.location.href = res.data.url;
        } catch (err) {
            console.error(err);
            alert("Stripe checkout failed. Please try again.");
            setLoading(false);
        }
    }

    return (
        <IconButton
            onClick={handleStripe}
            disabled={loading}
            icon="CreditCard"
            text={loading ? "Redirecting…" : "Pay with Stripe"}
            size="sm"
            rounded="xl"
            variant="optional"
            className={`
        w-full py-3 justify-center
        bg-linear-to-r from-purple-500 to-pink-500
        font-semibold shadow-lg
        hover:scale-[1.02] hover:shadow-pink-500/40
        disabled:opacity-60 disabled:cursor-not-allowed
        transition
        ${className}
      `}
        />
    );
}