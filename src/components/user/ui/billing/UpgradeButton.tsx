export async function upgradePlan(planId: string) {
    await fetch("/api/billing/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPlanId: planId }),
    });

    window.location.reload();
}