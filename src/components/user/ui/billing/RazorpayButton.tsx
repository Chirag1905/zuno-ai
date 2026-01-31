"use client";

import { IconButton } from "@/components/user/ui/Icon";
import toast from "react-hot-toast";

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

    const handleRazorpay = async (): Promise<void> => {
        await toast.promise(
            (async () => {
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
                        await toast.promise(
                            (async () => {
                                const verifyRes = await fetch(
                                    "/api/billing/razorpay/verify",
                                    {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            planId: plan.id,
                                            razorpay_payment_id:
                                                response.razorpay_payment_id,
                                            razorpay_order_id:
                                                response.razorpay_order_id,
                                            razorpay_signature:
                                                response.razorpay_signature,
                                        }),
                                    }
                                );

                                const verifyData = await verifyRes.json();

                                if (!verifyRes.ok || !verifyData.success) {
                                    throw new Error(
                                        verifyData.message ||
                                        "Payment verification failed"
                                    );
                                }

                                window.location.href = "/billing/success";
                            })(),
                            {
                                loading: "Verifying payment…",
                                success: "Payment successful 🎉",
                                error: (err) =>
                                    err.message || "Payment verification failed",
                            }
                        );
                    },
                });

                rzp.open();
            })(),
            {
                loading: "Creating Razorpay checkout…",
                success: "Redirecting to payment 💳",
                error: (err) => err.message || "Razorpay payment failed",
            }
        );
    };

    return (
        <IconButton
            onClick={handleRazorpay}
            icon="Wallet"
            text="Pay with Razorpay"
            size="sm"
            rounded="xl"
            variant="outline"
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