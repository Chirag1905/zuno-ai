"use client";

import RazorpayButton from "@/components/user/ui/billing/RazorpayButton";
import StripeButton from "@/components/user/ui/billing/StripeButton";


export default function PaymentModal({
    plan,
    open,
    onClose,
}: {
    plan: any;
    open: boolean;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
            <div className="w-full max-w-md rounded-2xl bg-[#0b0b1e] p-8 text-white shadow-2xl">
                <h2 className="text-2xl font-semibold">
                    Subscribe to {plan.name}
                </h2>

                <p className="mt-2 text-gray-400">
                    Choose your preferred payment method
                </p>

                <div className="mt-8 space-y-4">
                    <StripeButton plan={plan} />
                    <RazorpayButton plan={plan} />
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full text-sm text-gray-400 hover:text-white"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
