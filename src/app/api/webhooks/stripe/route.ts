import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const body = await req.text();
    const h = await headers();
    const sig = h.get("stripe-signature")!;

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch {
        return new Response("Invalid signature", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;

        // ✅ FIX: Get planId from metadata
        const planId = session.metadata?.planId;

        if (!planId) {
            console.error("❌ Stripe webhook missing planId in metadata");
            return new Response("Missing metadata", { status: 400 });
        }

        const payment = await prisma.payment.findFirst({
            where: { providerTxnId: session.id },
        });

        if (!payment) return new Response("Payment not found", { status: 404 });

        const plan = await prisma.plan.findUnique({
            where: { id: planId },
        });

        if (!plan) return new Response("Plan not found", { status: 404 });

        // ✅ FIX: Dynamic Duration
        const isYearly = plan.interval === "yearly";
        const intervalDays = isYearly ? 365 : 30;
        const billingInterval = isYearly ? "yearly" : "monthly";

        await prisma.$transaction([
            prisma.payment.update({
                where: { id: payment.id },
                data: { status: "SUCCESS" },
            }),
            prisma.subscription.updateMany({
                where: { userId: payment.userId, status: "ACTIVE" },
                data: { status: "EXPIRED" },
            }),
            prisma.subscription.create({
                data: {
                    userId: payment.userId,
                    planId: plan.id,
                    status: "ACTIVE",

                    startedAt: new Date(),
                    endsAt: new Date(Date.now() + intervalDays * 86400000),

                    periodStart: new Date(),
                    periodIntervalDays: intervalDays,

                    tokensRemaining: plan.maxTokens!,
                    provider: "stripe", // ✅ FIX: Correct provider name
                    billingInterval: billingInterval,
                },
            }),
        ]);
    }

    return new Response("OK", { status: 200 });
}