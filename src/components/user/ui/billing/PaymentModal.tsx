"use client";

import RazorpayButton from "@/components/user/ui/billing/RazorpayButton";
import StripeButton from "@/components/user/ui/billing/StripeButton";
import { IconButton } from "@/components/user/ui/Icon";

type Plan = {
    id: string;
    name: string;
    price: number;
};

export default function PaymentModal({
    plan,
    open,
    onClose,
}: {
    plan: Plan;
    open: boolean;
    onClose: () => void;
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            {/* GLOW BACKDROP */}
            <div className="absolute inset-0 bg-linear-to-br from-purple-600/10 via-pink-500/5 to-transparent" />

            {/* MODAL */}
            <div
                className="relative w-full max-w-md rounded-[28px]
        border border-white/10
        bg-linear-to-br from-[#0d0d2b]/90 to-[#070716]/90
        p-8 text-white
        shadow-[0_20px_60px_rgba(0,0,0,0.6)]
        backdrop-blur-xl
        animate-in fade-in zoom-in-95"
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
                            ${(plan.price / 100).toFixed(2)}
                            <span className="text-sm font-medium text-gray-400"> / month</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Cancel anytime · No hidden charges
                        </p>
                    </div>

                    <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                        Most Popular
                    </span>
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
                <p className="mt-5 text-center text-xs text-gray-500">
                    🔒 Secure payments powered by Razorpay & Stripe
                </p>

                {/* DIVIDER */}
                <div className="my-6 h-px w-full bg-white/10" />

                {/* CANCEL */}
                <IconButton
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
// "use client";

// import RazorpayButton from "@/components/user/ui/billing/RazorpayButton";
// import StripeButton from "@/components/user/ui/billing/StripeButton";
// import { IconButton } from "@/components/user/ui/Icon";

// export default function PaymentModal({
//     plan,
//     open,
//     onClose,
// }: {
//     plan: {
//         id: string;
//         name: string;
//         price: number;
//     };
//     open: boolean;
//     onClose: () => void;
// }) {
//     if (!open) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
//             {/* MODAL */}
//             <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0b1e]/90 p-8 text-white shadow-2xl">
//                 {/* HEADER */}
//                 <h2 className="text-2xl font-bold">
//                     Subscribe to{" "}
//                     <span className="bg-linear-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-extrabold">
//                         {plan.name}
//                     </span>
//                 </h2>

//                 <p className="mt-2 text-sm text-gray-400">
//                     Choose your preferred payment method
//                 </p>

//                 {/* PRICE INFO */}
//                 <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
//                     <span className="font-semibold text-white">
//                         ${(plan.price / 100).toFixed(2)}
//                     </span>{" "}
//                     billed monthly · Cancel anytime
//                 </div>

//                 {/* ACTIONS */}
//                 <div className="mt-8 space-y-4">
//                     {/* PRIMARY */}
//                     <RazorpayButton
//                         plan={plan}
//                         className="w-full rounded-xl py-3 bg-linear-to-r from-purple-500 to-pink-500 font-semibold shadow-lg shadow-pink-500/20 hover:scale-[1.02] hover:shadow-pink-500/40 transition"
//                     />

//                     {/* SECONDARY */}
//                     <StripeButton
//                         plan={plan}
//                         className="w-full rounded-xl py-3 bg-linear-to-r from-purple-500 to-pink-500 font-semibold shadow-lg shadow-pink-500/20 hover:scale-[1.02] hover:shadow-pink-500/40 transition"
//                     />
//                 </div>

//                 {/* DIVIDER */}
//                 <div className="my-6 h-px w-full bg-white/10" />

//                 {/* CANCEL */}
//                 <IconButton
//                     icon="X"
//                     size="sm"
//                     rounded="xl"
//                     variant="default"
//                     text="Cancel"
//                     onClick={onClose}
//                     className="w-full justify-center rounded-lg py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition"
//                 />
//             </div>
//         </div>
//     );
// }