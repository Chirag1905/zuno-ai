"use client";

import { useEffect, useState } from "react";
import PlanCard from "@/components/ui/billing/PlanCard";
import PaymentModal from "@/components/ui/billing/PaymentModal";
import { Plan } from "@/types/billing";
import { billingService } from "@/services/billing.api";

export default function PricingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    useEffect(() => {
        billingService.getPlans().then((res) => setPlans(res.data.data));
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
            <div className="max-w-7xl mx-auto mt-14">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
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
            {selectedPlan && (
                <PaymentModal
                    plan={selectedPlan}
                    open={true}
                    featured={selectedPlan.name === "PRO"}
                    onClose={() => setSelectedPlan(null)}
                />
            )}
        </>
    );
}