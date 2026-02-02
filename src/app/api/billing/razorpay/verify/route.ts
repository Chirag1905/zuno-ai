import crypto from "crypto";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guards";
import { apiResponse } from "@/types/apiResponse";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const { session } = await requireAuth();
        const userId = session.user.id;

        const {
            planId,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
        } = await req.json();

        if (
            !planId ||
            !razorpay_payment_id ||
            !razorpay_order_id ||
            !razorpay_signature
        ) {
            return apiResponse(false, "Invalid payload", null, null, 400);
        }

        // 🔐 Verify signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return apiResponse(
                false,
                "Payment verification failed",
                null,
                null,
                400
            );
        }

        const plan = await prisma.plan.findUnique({
            where: { id: planId },
        });

        if (!plan) {
            return apiResponse(false, "Plan not found", null, null, 404);
        }

        // 🔍 Check if payment already exists
        const existingPayment = await prisma.payment.findUnique({
            where: { providerTxnId: razorpay_payment_id },
        });

        if (existingPayment) {
            return apiResponse(true, "Payment already processed", null);
        }

        await prisma.$transaction([
            // 1️⃣ Save payment
            prisma.payment.create({
                data: {
                    user: { connect: { id: userId } },
                    amount: Math.round(plan.price * 100),
                    currency: plan.currency,
                    status: "SUCCESS",
                    provider: "razorpay",
                    providerTxnId: razorpay_payment_id,
                    tokensRemaining: plan.maxTokens ?? 0,
                },
            }),

            // 2️⃣ Expire old subscriptions
            prisma.subscription.updateMany({
                where: { userId, status: "ACTIVE" },
                data: { status: "EXPIRED" },
            }),

            // 3️⃣ Create new subscription
            prisma.subscription.create({
                data: {
                    user: { connect: { id: userId } },
                    plan: { connect: { id: plan.id } },
                    status: "ACTIVE",

                    startedAt: new Date(),
                    endsAt: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                    ),

                    periodStart: new Date(),
                    periodIntervalDays: 30,
                    billingInterval: "monthly",

                    tokensRemaining: plan.maxTokens!,
                    provider: "razorpay",
                    providerSubscriptionId: razorpay_order_id,
                },
            }),
        ]);

        return apiResponse(
            true,
            "Payment verified & subscription activated",
            null
        );
    } catch (err: unknown) {
        console.error("❌ Razorpay verify error:", err);

        const error = err as { code?: string; meta?: { target?: string[] }; message?: string };

        // Handle duplicate payment (Idempotency)
        if (error.code === "P2002" && error.meta?.target?.includes("providerTxnId")) {
            return apiResponse(
                true,
                "Payment already verified",
                null
            );
        }

        return apiResponse(
            false,
            "Payment verification failed",
            null,
            { message: error.message || 'Unknown error' },
            500
        );
    }
}


// import crypto from "crypto";
// import prisma from "@/lib/prisma";
// import { requireAuth } from "@/lib/auth/guards";
// import { apiResponse } from "@/utils/apiResponse";

// export async function POST(req: Request) {
//     const { session } = await requireAuth();
//     const userId = session.user.id;

//     const {
//         planId,
//         razorpay_payment_id,
//         razorpay_order_id,
//         razorpay_signature,
//     } = await req.json();

//     const body = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSignature = crypto
//         .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
//         .update(body)
//         .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//         return apiResponse(false, "Invalid payment signature", null, null, 400);
//     }

//     const plan = await prisma.plan.findUnique({ where: { id: planId } });
//     if (!plan) {
//         return apiResponse(false, "Plan not found", null, null, 404);
//     }

//     await prisma.$transaction([
//         // 1️⃣ Store payment
//         prisma.payment.create({
//             data: {
//                 userId,
//                 amount: Math.round(plan.price * 100),
//                 currency: plan.currency,
//                 status: "SUCCESS",
//                 provider: "razorpay",
//                 providerTxnId: razorpay_payment_id,
//             },
//         }),

//         // 2️⃣ Expire existing subscriptions
//         prisma.subscription.updateMany({
//             where: {
//                 userId,
//                 status: "ACTIVE",
//             },
//             data: { status: "EXPIRED" },
//         }),

//         // 3️⃣ Create new subscription
//         prisma.subscription.create({
//             data: {
//                 userId,
//                 planId: plan.id,
//                 status: "ACTIVE",
//                 startedAt: new Date(),
//                 endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

//                 periodStart: new Date(),
//                 periodIntervalDays: 30,
//                 billingInterval: "monthly",

//                 tokensRemaining: plan.maxTokens!,
//                 provider: "razorpay",
//                 providerSubscriptionId: razorpay_order_id,
//             },
//         }),
//     ]);

//     return apiResponse(true, "Payment verified & subscription activated", null);
// }
