import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guards";
import { apiResponse } from "@/types/apiResponse";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { session } = await requireAuth();
        const userId = session.user.id;

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error("Razorpay keys missing");
        }

        const { planId } = await req.json();
        if (!planId) {
            return apiResponse(false, "Plan ID required", null, null, 400);
        }

        const plan = await prisma.plan.findUnique({
            where: { id: planId },
        });

        if (!plan || !plan.isActive) {
            return apiResponse(false, "Plan not found", null, null, 404);
        }


        // ❌ Never send FREE plan to Razorpay
        if (plan.price <= 0) {
            return apiResponse(
                false,
                "Free plan does not require payment",
                null,
                null,
                400
            );
        }

        // 🔍 Check if user already has this plan active
        const existingSubscription = await prisma.subscription.findFirst({
            where: {
                userId,
                planId: plan.id,
                status: "ACTIVE",
            },
        });

        if (existingSubscription) {
            return apiResponse(
                false,
                "You are already subscribed to this plan",
                null,
                null,
                400
            );
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: Math.round(plan.price * 100), // INR -> paise
            currency: plan.currency || "INR",
            receipt: `rcpt_${Date.now()}`, // ✅ <= 40 chars
        });

        return apiResponse(true, "Order created", {
            key: process.env.RAZORPAY_KEY_ID,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            planId: plan.id,
        });
    } catch (err: unknown) {
        console.error("❌ Razorpay checkout error:", err);
        const error = err as { message?: string; statusCode?: number; error?: unknown };

        return apiResponse(
            false,
            "Failed to create Razorpay order",
            null,
            {
                message: error?.message,
                statusCode: error?.statusCode,
                error: error?.error,
            },
            500
        );
    }
}
