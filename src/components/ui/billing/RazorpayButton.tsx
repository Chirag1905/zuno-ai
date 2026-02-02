"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            open: () => void;
        };
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayButtonProps {
    plan: {
        id: string;
        name: string;
    };
    className?: string;
}

export default function RazorpayButton({
    plan,
    className = "",
}: RazorpayButtonProps) {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const handleRazorpay = async (): Promise<void> => {
        if (loading) return;
        setLoading(true);

        try {
            const res = await fetch("/api/billing/razorpay/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ planId: plan.id }),
            });

            const data = await res.json();

            if (!res.ok || !data?.success) {
                throw new Error(data?.message || "Razorpay checkout failed");
            }

            if (!window.Razorpay) {
                throw new Error("Razorpay SDK not loaded");
            }

            const { key, amount, currency, orderId } = data.data;

            const rzp = new window.Razorpay({
                key,
                amount,
                currency,
                name: "Zuno AI",
                description: plan.name,
                order_id: orderId,

                handler: async (response: RazorpayResponse) => {
                    const params = new URLSearchParams({
                        planId: plan.id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                    });

                    router.push(`/verify-payment?${params.toString()}`);
                },
            });

            rzp.open();
        } catch (error: any) {
            toast.error(error.message || "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleRazorpay}
            icon="Wallet"
            text={loading ? "Processing..." : "Pay with Razorpay"}
            size="sm"
            rounded="xl"
            variant="outline"
            disabled={loading}
            className={`
        w-full py-3 justify-center
        border border-white/20
        hover:bg-white/10
        transition
        ${className}
      `}
        />
    );
}