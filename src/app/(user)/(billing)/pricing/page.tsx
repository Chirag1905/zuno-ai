"use client";

import { useEffect, useState } from "react";
import PlanCard from "@/components/user/ui/billing/PlanCard";
import PaymentModal from "@/components/user/ui/billing/PaymentModal";
import { fetchPlans } from "@/lib/billing/billing";

export default function PricingPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

    useEffect(() => {
        fetchPlans().then((res) => setPlans(res.data));
    }, []);

    return (
        <>
            {/* HEADER */}
            <div className="mt-4 text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Choose your plan
                </h1>
                <p className="text-neutral-400">
                    Simple pricing. Cancel anytime.
                </p>
            </div>

            {/* PRICING CONTAINER */}
            <div className="mt-4 rounded-3xl backdrop-blur-xl p-10 md:p-14 shadow-2xl">
                <div className="grid gap-10 md:grid-cols-3">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            featured={plan.name === "PRO"}
                            onSelect={() => setSelectedPlan(plan)}
                        />
                    ))}
                </div>
            </div>

            {/* PAYMENT MODAL */}
            <PaymentModal
                plan={selectedPlan}
                open={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
            />
        </>
    );
}