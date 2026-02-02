import Razorpay from "razorpay";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/guards";
import { apiResponse } from "@/utils/apiResponse";

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

        // const amount = Math.round(plan.price * 100); // INR → paise

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
    } catch (err: any) {
        console.error("❌ Razorpay checkout error:", err);

        return apiResponse(
            false,
            "Failed to create Razorpay order",
            null,
            {
                message: err?.message,
                statusCode: err?.statusCode,
                error: err?.error,
            },
            500
        );
    }
}


// import Razorpay from "razorpay";
// import prisma from "@/lib/prisma";
// import { requireAuth } from "@/lib/auth/guards";
// import { apiResponse } from "@/utils/apiResponse";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//     try {
//         const { session } = await requireAuth();
//         const userId = session.user.id;

//         if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
//             throw new Error("Razorpay env missing");
//         }

//         const { planId } = await req.json();
//         const plan = await prisma.plan.findUnique({ where: { id: planId } });

//         if (!plan) {
//             return apiResponse(false, "Plan not found", null, null, 404);
//         }

//         if (plan.price <= 0) {
//             return apiResponse(
//                 false,
//                 "Free plan does not require payment",
//                 null,
//                 null,
//                 400
//             );
//         }

//         const razorpay = new Razorpay({
//             key_id: process.env.RAZORPAY_KEY_ID,
//             key_secret: process.env.RAZORPAY_KEY_SECRET,
//         });

//         const amount = Math.round(plan.price * 100);

//         console.log("💰 Razorpay order:", amount, plan.currency);

//         const order = await razorpay.orders.create({
//             amount,
//             currency: plan.currency || "INR",
//             receipt: `user_${userId}_${Date.now()}`,
//         });

//         return apiResponse(true, "Order created", {
//             key: process.env.RAZORPAY_KEY_ID,
//             orderId: order.id,
//             amount: order.amount,
//             currency: order.currency,
//         });
//     } catch (err: any) {
//         console.error("❌ Razorpay FULL error:", err);

//         return apiResponse(
//             false,
//             "Failed to create Razorpay order",
//             null,
//             {
//                 message: err?.message,
//                 statusCode: err?.statusCode,
//                 error: err?.error,
//             },
//             500
//         );
//     }
// }


// import Razorpay from "razorpay";
// import prisma from "@/lib/prisma";
// import { requireAuth } from "@/lib/auth/guards";
// import { apiResponse } from "@/utils/apiResponse";

// export const runtime = "nodejs"; // 🔥 REQUIRED

// export async function POST(req: Request) {
//     try {
//         /* ============================
//            ENV CHECK
//         ============================ */
//         if (
//             !process.env.RAZORPAY_KEY_ID ||
//             !process.env.RAZORPAY_KEY_SECRET
//         ) {
//             console.error("❌ Razorpay env missing");
//             return apiResponse(
//                 false,
//                 "Razorpay not configured",
//                 null,
//                 null,
//                 500
//             );
//         }

//         /* ============================
//            AUTH
//         ============================ */
//         const { session } = await requireAuth();
//         const userId = session.user.id;

//         /* ============================
//            BODY
//         ============================ */
//         const { planId } = await req.json();

//         if (!planId) {
//             return apiResponse(false, "Plan ID required", null, null, 400);
//         }

//         /* ============================
//            PLAN
//         ============================ */
//         const plan = await prisma.plan.findUnique({
//             where: { id: planId },
//         });

//         if (!plan || !plan.isActive) {
//             return apiResponse(false, "Plan not found", null, null, 404);
//         }

//         /* ============================
//            RAZORPAY INSTANCE
//         ============================ */
//         const razorpay = new Razorpay({
//             key_id: process.env.RAZORPAY_KEY_ID,
//             key_secret: process.env.RAZORPAY_KEY_SECRET,
//         });

//         /* ============================
//            CREATE ORDER
//         ============================ */
//         const order = await razorpay.orders.create({
//             amount: Math.round(plan.price * 100), // INR → paise
//             currency: plan.currency || "INR",
//             receipt: `user_${userId}_plan_${plan.id}_${Date.now()}`,
//         });

//         /* ============================
//            RESPONSE
//         ============================ */
//         return apiResponse(true, "Order created", {
//             key: process.env.RAZORPAY_KEY_ID,
//             orderId: order.id,
//             amount: order.amount,
//             currency: order.currency,
//             planId: plan.id,
//         });
//     } catch (err: any) {
//         console.error("❌ Razorpay checkout error:", err);

//         return apiResponse(
//             false,
//             "Failed to create Razorpay order",
//             null,
//             { message: err.message },
//             500
//         );
//     }
// }



// import { requireAuth } from "@/lib/auth/guards";
// import prisma from "@/lib/prisma";
// import { razorpay } from "@/lib/razorpay";
// import { apiResponse } from "@/utils/apiResponse";

// export async function POST(req: Request) {
//     console.log("➡️ Razorpay checkout called");

//     try {
//         const auth = await requireAuth();
//         console.log("✅ Auth:", auth);

//         const body = await req.json();
//         console.log("📦 Body:", body);

//         const { planId } = body;

//         const plan = await prisma.plan.findUnique({
//             where: { id: planId },
//         });
//         console.log("📄 Plan:", plan);

//         if (!plan) {
//             return apiResponse(false, "Plan not found", null, null, 400);
//         }

//         if (!plan.isActive) {
//             return apiResponse(false, "Plan inactive", null, null, 400);
//         }

//         if (plan.currency !== "INR") {
//             return apiResponse(false, "Razorpay supports INR only", null, null, 400);
//         }

//         console.log("💰 Creating Razorpay order...");

//         const order = await razorpay.orders.create({
//             amount: Number(plan.price),
//             currency: "INR",
//             receipt: `zuno_${Date.now()}`,
//         });

//         console.log("✅ Order created:", order);

//         await prisma.payment.create({
//             data: {
//                 userId: auth.session.user.id,
//                 amount: plan.price,
//                 currency: "INR",
//                 status: "PENDING",
//                 provider: "razorpay",
//                 providerTxnId: order.id,
//             },
//         });

//         return apiResponse(true, "Order created", {
//             orderId: order.id,
//             key: process.env.RAZORPAY_KEY_ID,
//             amount: plan.price,
//             currency: "INR",
//         });
//     } catch (error: any) {
//         console.error("❌ Razorpay ERROR FULL:", error);
//         console.error("❌ Razorpay ERROR MESSAGE:", error?.message);
//         console.error("❌ Razorpay ERROR STACK:", error?.stack);

//         return apiResponse(
//             false,
//             error?.message ?? "Razorpay internal error",
//             null,
//             null,
//             500
//         );
//     }
// }

// import { requireAuth } from "@/lib/auth/guards";
// import prisma from "@/lib/prisma";
// import { razorpay } from "@/lib/razorpay";
// import { apiResponse } from "@/utils/apiResponse";

// export async function POST(req: Request) {
//     try {
//         const { session } = await requireAuth();

//         const { planId } = await req.json();

//         const plan = await prisma.plan.findUnique({
//             where: { id: planId },
//         });

//         if (!plan || !plan.isActive) {
//             return apiResponse(false, "Invalid plan", null, null, 400);
//         }

//         if (plan.currency !== "INR") {
//             return apiResponse(false, "Razorpay supports INR only", null, null, 400);
//         }

//         const order = await razorpay.orders.create({
//             amount: plan.price, // paise
//             currency: "INR",
//             receipt: `zuno_${Date.now()}`,
//         });

//         await prisma.payment.create({
//             data: {
//                 userId: session.user.id,
//                 amount: plan.price,
//                 currency: "INR",
//                 status: "PENDING",
//                 provider: "razorpay",
//                 providerTxnId: order.id,
//             },
//         });

//         return apiResponse(true, "Order created", {
//             orderId: order.id,
//             key: process.env.RAZORPAY_KEY_ID,
//             amount: plan.price,
//             currency: "INR",
//         });
//     } catch (error: any) {
//         console.error("Razorpay order error:", error);
//         return apiResponse(false, error.message, null, null, 500);
//     }
// }
