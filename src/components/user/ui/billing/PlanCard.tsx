"use client";

export default function PlanCard({
    plan,
    onSelect,
}: {
    plan: any;
    onSelect: () => void;
}) {
    const isFree = plan.price === 0;

    return (
        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-white shadow-xl transition hover:-translate-y-2 hover:shadow-purple-500/30">
            <h2 className="text-xl font-semibold">{plan.name}</h2>

            <p className="mt-6 text-4xl font-bold">
                {isFree ? "Free" : `$${(plan.price / 100).toFixed(2)}`}
            </p>

            <ul className="mt-6 space-y-2 text-sm text-gray-300">
                <li>✨ Tokens: {plan.maxTokens ?? "Unlimited"}</li>
                <li>💬 Chats: {plan.maxChats ?? "Unlimited"}</li>
            </ul>

            {isFree ? (
                <button
                    disabled
                    className="mt-8 w-full rounded-lg bg-gray-700 py-3 text-sm opacity-60 cursor-not-allowed"
                >
                    Current Plan
                </button>
            ) : (
                <button
                    onClick={onSelect}
                    className="mt-8 w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 py-3 text-sm font-semibold transition hover:opacity-90"
                >
                    Choose Plan
                </button>
            )}
        </div>
    );
}
