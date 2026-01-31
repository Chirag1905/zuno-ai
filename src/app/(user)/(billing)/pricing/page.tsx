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
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                    Choose your plan
                </h1>
                <p className="text-neutral-400 text-sm md:text-base">
                    Simple pricing. Cancel anytime.
                </p>
            </div>

            {/* PRICING GRID */}
            <div className="mt-14">
                <div className="grid gap-8 md:grid-cols-3 items-stretch">
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
                featured={selectedPlan?.name === "PRO"}
                onClose={() => setSelectedPlan(null)}
            />
        </>
    );
}