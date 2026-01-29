export async function fetchPlans() {
    const res = await fetch("/api/billing/plans");
    return res.json();
}

export async function createStripeCheckout(planId: string) {
    const res = await fetch("/api/billing/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
    });
    return res.json();
}

export async function createRazorpayOrder(planId: string) {
    const res = await fetch("/api/billing/razorpay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
    });
    return res.json();
}