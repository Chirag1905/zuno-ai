"use client";

import Button from "@/components/ui/Button";
import { Plan } from "@/generated/prisma/client";
import { useRouter } from "next/navigation";

export default function PlanCard({
    plan,
    onSelect,
    featured = false,
}: {
    plan: Plan;
    onSelect: () => void;
    featured?: boolean;
}) {
    const router = useRouter();
    const isFree = plan.price === 0;

    return (
        <div
            className={`relative flex flex-col rounded-[28px] border p-8 text-white min-h-[480px] transition-all
      ${featured
                    ? "border-purple-500/60 bg-linear-to-br from-purple-500/20 to-pink-500/10 scale-[1.05] shadow-[0_30px_80px_rgba(168,85,247,0.45)]"
                    : "border-white/10 bg-white/4 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(168,85,247,0.25)]"
                }`}
        >
            {/* BADGE */}
            {featured && (
                <span className="absolute -top-3 right-6 rounded-full bg-linear-to-r from-purple-500 to-pink-500 px-4 py-1 text-xs font-semibold shadow-lg">
                    Most Popular
                </span>
            )}

            {/* TITLE */}
            {/* <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {plan.name}
            </p> */}

            <span className="bg-linear-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent font-extrabold">
                {plan.name}
            </span>

            {/* PRICE */}
            <div className="mt-4">
                {/* <span className="text-4xl font-extrabold">
                    {isFree ? "Free" : `$${(plan.price / 100).toFixed(2)}`}
                </span> */}
                <span className="text-4xl font-extrabold">
                    {isFree
                        ? "Free"
                        : `₹${new Intl.NumberFormat("en-IN").format(plan.price)}`}
                </span>
                {!isFree && (
                    <span className="ml-2 text-sm text-gray-400">/ month</span>
                )}
            </div>

            {/* DESCRIPTION */}
            <p className="mt-3 text-sm text-gray-400">
                {plan.name === "FREE" && "Get started and explore the basics"}
                {plan.name === "PRO" && "Best for regular usage and professionals"}
                {plan.name === "PREMIUM" && "For teams & power users"}
            </p>

            {/* DIVIDER */}
            <div className="my-6 h-px w-full bg-white/10" />

            {/* FEATURES */}
            <ul className="space-y-3 text-sm text-gray-300 flex-1">
                <li>✔ {plan.maxTokens ?? "Unlimited"} Tokens</li>
                <li>✔ {plan.maxChats ?? "Unlimited"} Chats</li>
                <li>✔ Faster response speed</li>
                <li>✔ Priority queue access</li>
                {plan.name !== "FREE" && <li>✔ Email support</li>}
                {plan.name === "PREMIUM" && <li>✔ Dedicated support</li>}
            </ul>

            {/* CTA */}
            <Button
                text={isFree ? "Current Plan" : "Choose Plan"}
                icon={isFree ? "Check" : "SquareArrowOutUpRight"}
                iconPosition="right"
                size="sm"
                rounded="xl"
                variant="minimal"
                className={`mt-8 w-full py-3 justify-center ${isFree
                    ? "bg-gray-700/60 hover:bg-gray-700/80"
                    : "bg-linear-to-r from-purple-500 to-pink-500 font-semibold shadow-lg hover:scale-[1.03] hover:shadow-pink-500/50 transition"
                    }`}
                onClick={() => {
                    if (isFree) {
                        router.push('/');
                    } else {
                        onSelect();
                    }
                }}
            />
        </div>
    );
}