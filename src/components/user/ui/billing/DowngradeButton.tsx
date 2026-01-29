export async function downgradePlan(planId: string) {
    await fetch("/api/billing/downgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPlanId: planId }),
    });

    window.location.reload();
}