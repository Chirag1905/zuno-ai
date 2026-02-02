"use client";

import RazorpayButton from "@/components/ui/billing/RazorpayButton";
import StripeButton from "@/components/ui/billing/StripeButton";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";

import { Plan } from "@/types/billing";

export default function PaymentModal({
    plan,
    open,
    onClose,
    featured,
}: {
    plan: Plan;
    open: boolean;
    onClose: () => void;
    featured?: boolean;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            {/* GLOW BACKDROP */}
            <div className="absolute inset-0 bg-linear-to-br from-purple-600/10 via-pink-500/5 to-transparent" />

            {/* MODAL */}
            <div
                className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-linear-to-br from-[#0d0d2b]/90 to-[#070716]/90 p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in fade-in zoom-in-95"
            >
                {/* HEADER */}
                <h2 className="text-2xl font-semibold tracking-tight">
                    Upgrade to{" "}
                    <span className="bg-linear-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent font-extrabold">
                        {plan.name}
                    </span>
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                    Unlock premium features & priority access
                </p>

                {/* PRICE CARD */}
                <div
                    className="mt-5 rounded-2xl border border-white/10 bg-white/4 p-4 flex items-center justify-between"
                >
                    <div>
                        <p className="text-2xl font-bold text-white">
                            ₹{new Intl.NumberFormat("en-IN").format(plan.price)}
                            <span className="text-sm font-medium text-gray-400"> / month</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Cancel anytime · No hidden charges
                        </p>
                    </div>

                    {featured && (
                        <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                            Most Popular
                        </span>
                    )}
                </div>

                {/* PAYMENT ACTIONS */}
                <div className="mt-8 space-y-4">
                    {/* PRIMARY (INDIA FIRST) */}
                    <RazorpayButton
                        plan={plan}
                        className="w-full rounded-xl py-3.5 bg-linear-to-r from-purple-500 to-pink-500 font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-pink-500/50 hover:scale-[1.03] transition-all duration-300"
                    />

                    {/* SECONDARY */}
                    <StripeButton
                        plan={plan}
                        className="w-full rounded-xl py-3.5 bg-linear-to-r from-purple-500 to-pink-500 font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-pink-500/50 hover:scale-[1.03] transition-all duration-300"
                    />
                </div>

                {/* TRUST NOTE */}
                <p className="flex justify-center items-center gap-2 mt-5 text-center text-xs text-gray-500">
                    <Icon name="Lock" size={14} />
                    Secure payments powered by Razorpay & Stripe
                </p>

                {/* DIVIDER */}
                <div className="my-6 h-px w-full bg-white/10" />

                {/* CANCEL */}
                <Button
                    icon="X"
                    size="sm"
                    rounded="xl"
                    variant="default"
                    text="Cancel"
                    onClick={onClose}
                    className="w-full justify-center rounded-lg py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
                />
            </div>
        </div>
    );
}