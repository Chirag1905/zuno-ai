"use client";

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function RazorpayButton({ plan }: { plan: any }) {
    async function handleRazorpay() {
        const res = await fetch("/api/billing/razorpay/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId: plan.id }),
        });

        const data = await res.json();

        if (!res.ok || !data?.success) {
            alert(data?.message || "Razorpay checkout failed");
            return;
        }

        const { key, amount, currency, orderId } = data.data;

        if (!window.Razorpay) {
            alert("Razorpay SDK not loaded");
            return;
        }

        const rzp = new window.Razorpay({
            key,
            amount,
            currency,
            name: "Zuno AI",
            description: plan.name,
            order_id: orderId,

            handler: async (response: any) => {
                const verifyRes = await fetch(
                    "/api/billing/razorpay/verify",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
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

                if (verifyRes.ok && verifyData.success) {
                    window.location.href = "/billing/success";
                } else {
                    alert(
                        verifyData.message ||
                        "Payment verification failed"
                    );
                }
            },
        });

        rzp.open();
    }

    return (
        <button
            onClick={handleRazorpay}
            className="w-full rounded-lg border border-white/20 py-3 transition hover:bg-white/10"
        >
            Pay with Razorpay
        </button>
    );
}