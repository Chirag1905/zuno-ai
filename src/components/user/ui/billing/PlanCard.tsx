"use client";

import { IconButton } from "@/components/user/ui/Icon";
import { Plan } from "@/generated/prisma/client";

export default function PlanCard({
    plan,
    onSelect,
    featured = false,
}: {
    plan: Plan;
    onSelect: () => void;
    featured?: boolean;
}) {
    const isFree = plan.price === 0;

    return (
        <div
            className={`relative flex flex-col rounded-2xl border p-8 text-white transition shadow-xl min-h-[460px]
        ${featured
                    ? "border-purple-500/60 bg-linear-to-b from-purple-500/15 to-pink-500/5 scale-[1.03] shadow-purple-500/40"
                    : "border-white/10 bg-white/5 hover:-translate-y-2 hover:shadow-purple-500/30"
                }
      `}
        >
            {/* BADGE */}
            {featured && (
                <span className="absolute -top-3 right-6 rounded-full bg-linear-to-r from-purple-500 to-pink-500 px-4 py-1 text-xs font-semibold shadow-md">
                    Most Popular
                </span>
            )}

            {/* PLAN TITLE */}
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-300">
                {plan.name}
            </h2>

            {/* PRICE */}
            <div className="mt-3">
                <span className="text-4xl font-bold">
                    {isFree ? "Free" : `$${(plan.price / 100).toFixed(2)}`}
                </span>
                {!isFree && (
                    <span className="ml-2 text-sm text-gray-400">/ month</span>
                )}
            </div>

            {/* SHORT DESC */}
            <p className="mt-3 text-sm text-gray-400">
                {plan.name === "FREE" && "Get started and explore the basics"}
                {plan.name === "PRO" && "Best for regular usage and professionals"}
                {plan.name === "PREMIUM" && "For teams & power users"}
            </p>

            {/* DIVIDER */}
            <div className="my-6 h-px w-full bg-white/10" />

            {/* FEATURES */}
            <ul className="space-y-3 text-sm text-gray-300 flex-1">
                <li className="flex items-center gap-2">
                    <span className="text-purple-400">✔</span>
                    {plan.maxTokens ?? "Unlimited"} Tokens
                </li>

                <li className="flex items-center gap-2">
                    <span className="text-purple-400">✔</span>
                    {plan.maxChats ?? "Unlimited"} Chats
                </li>

                <li className="flex items-center gap-2">
                    <span className="text-purple-400">✔</span>
                    Faster response speed
                </li>

                <li className="flex items-center gap-2">
                    <span className="text-purple-400">✔</span>
                    Priority queue access
                </li>

                {plan.name !== "FREE" && (
                    <li className="flex items-center gap-2">
                        <span className="text-purple-400">✔</span>
                        Email support
                    </li>
                )}

                {plan.name === "PREMIUM" && (
                    <li className="flex items-center gap-2">
                        <span className="text-purple-400">✔</span>
                        Dedicated support
                    </li>
                )}
            </ul>

            {/* CTA */}
            <IconButton
                text={isFree ? "Current Plan" : "Choose Plan"}
                size="sm"
                rounded="xl"
                variant="minimal"
                className={`mt-8 w-full py-3 text-sm justify-center ${isFree
                    ? "bg-gray-700 opacity-60 cursor-not-allowed"
                    : "bg-linear-to-r from-purple-500 to-pink-500 font-semibold shadow-lg hover:scale-[1.02] hover:shadow-pink-500/40 transition"
                    }`}
                onClick={!isFree ? onSelect : undefined}
                disabled={isFree}
            />
        </div>
    );
}