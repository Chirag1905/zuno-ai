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
        <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-6 py-24">
            <h1 className="text-center text-5xl font-bold text-white">
                Choose your plan
            </h1>

            <p className="text-center text-gray-400 mt-4">
                Simple pricing. Cancel anytime.
            </p>

            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 mt-20">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        onSelect={() => setSelectedPlan(plan)}
                    />
                ))}
            </div>

            <PaymentModal
                plan={selectedPlan}
                open={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
            />
        </div>
    );
}
