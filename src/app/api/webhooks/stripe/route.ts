import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req: Request) {
    const body = await req.text();
    const sig = headers().get("stripe-signature")!;

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

        const payment = await prisma.payment.findFirst({
            where: { providerTxnId: session.id },
        });

        if (!payment) return new Response("Payment not found", { status: 404 });

        const plan = await prisma.plan.findFirst({
            where: { price: payment.amount },
        });

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
                    endsAt: new Date(Date.now() + 30 * 86400000),

                    periodStart: new Date(),
                    periodIntervalDays: 30,

                    tokensRemaining: plan.maxTokens!,
                    provider: "razorpay",
                    billingInterval: "monthly",
                },
            }),
        ]);
    }

    return new Response("OK", { status: 200 });
}