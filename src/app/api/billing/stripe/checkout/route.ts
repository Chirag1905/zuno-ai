import { requireAuth } from "@/lib/auth/guards";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { apiResponse } from "@/utils/apiResponse";

export async function POST(req: Request) {
    try {
        const { session } = await requireAuth();

        if (!session?.user?.email) {
            return apiResponse(false, "Unauthorized", null, null, 401);
        }

        const { planId } = await req.json();

        const plan = await prisma.plan.findUnique({
            where: { id: planId },
        });

        if (!plan || !plan.isActive || !plan.stripePriceId) {
            return apiResponse(false, "Invalid plan", null, null, 400);
        }

        const checkout = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer_email: session.user.email,
            line_items: [
                {
                    price: plan.stripePriceId, // ✅ REQUIRED
                    quantity: 1,
                },
            ],
            success_url: `${process.env.APP_URL}/billing/success`,
            cancel_url: `${process.env.APP_URL}/billing/cancel`,
        });

        await prisma.payment.create({
            data: {
                userId: session.user.id,
                amount: plan.price,
                currency: plan.currency,
                status: "PENDING",
                provider: "stripe",
                providerTxnId: checkout.id,
            },
        });

        return apiResponse(true, "Checkout created", {
            url: checkout.url,
        });
    } catch (error: any) {
        console.error("Stripe checkout error:", error);
        return apiResponse(false, error.message, null, null, 500);
    }
}
