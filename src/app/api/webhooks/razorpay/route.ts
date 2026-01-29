import crypto from "crypto";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export const runtime = "nodejs";

/* ============================
   SIGNATURE VERIFICATION
============================ */
function verifySignature(body: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  return expected === signature;
}

/* ============================
   WEBHOOK HANDLER
============================ */
export async function POST(req: Request) {
  const rawBody = await req.text();

  const headerList = await headers(); // ✅ FIX 1
  const signature = headerList.get("x-razorpay-signature");

  if (!signature || !verifySignature(rawBody, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(rawBody);

  /* ============================
     PAYMENT CAPTURED
  ============================ */
  if (event.event === "payment.captured") {
    const paymentEntity = event.payload.payment.entity;

    const razorpayPaymentId = paymentEntity.id;
    const razorpayOrderId = paymentEntity.order_id;
    const { planId, userId } = paymentEntity.notes || {};

    if (!planId || !userId) {
      return new Response("Missing metadata", { status: 400 });
    }

    // ✅ FIX 2 (findUnique works only if providerTxnId is @unique)
    const existing = await prisma.payment.findUnique({
      where: { providerTxnId: razorpayPaymentId },
    });

    if (existing?.status === "SUCCESS") {
      return new Response("Already processed", { status: 200 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return new Response("Plan not found", { status: 404 });
    }

    await prisma.$transaction([
      prisma.payment.upsert({
        where: { providerTxnId: razorpayPaymentId },
        update: { status: "SUCCESS" },
        create: {
          userId,
          amount: paymentEntity.amount,
          currency: paymentEntity.currency,
          status: "SUCCESS",
          provider: "razorpay",
          providerTxnId: razorpayPaymentId,
        },
      }),

      prisma.subscription.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "EXPIRED" },
      }),

      prisma.subscription.create({
        data: {
          userId,
          planId,
          status: "ACTIVE",
          startedAt: new Date(),
          endsAt: new Date(Date.now() + 30 * 86400000),

          periodStart: new Date(),
          periodIntervalDays: 30,
          billingInterval: "monthly",
          tokensRemaining: plan.maxTokens!,
          provider: "razorpay",
          providerSubscriptionId: razorpayOrderId,
        },
      }),
    ]);
  }

  /* ============================
     PAYMENT FAILED
  ============================ */
  if (event.event === "payment.failed") {
    const paymentEntity = event.payload.payment.entity;

    await prisma.payment.updateMany({
      where: { providerTxnId: paymentEntity.id },
      data: { status: "FAILED" },
    });
  }

  return new Response("OK", { status: 200 });
}


// import crypto from "crypto";
// import prisma from "@/lib/prisma";
// import { headers } from "next/headers";

// export const runtime = "nodejs";

// /* ============================
//    SIGNATURE VERIFICATION
// ============================ */
// function verifySignature(body: string, signature: string) {
//   const expected = crypto
//     .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
//     .update(body)
//     .digest("hex");

//   return expected === signature;
// }

// /* ============================
//    WEBHOOK HANDLER
// ============================ */
// export async function POST(req: Request) {
//   const rawBody = await req.text();
//   const headerList = await headers();
//   const signature = headerList.get("x-razorpay-signature");

//   if (!signature || !verifySignature(rawBody, signature)) {
//     console.error("❌ Invalid Razorpay webhook signature");
//     return new Response("Invalid signature", { status: 400 });
//   }

//   const event = JSON.parse(rawBody);

//   /* ============================
//      PAYMENT CAPTURED
//   ============================ */
//   if (event.event === "payment.captured") {
//     const paymentEntity = event.payload.payment.entity;

//     const razorpayPaymentId = paymentEntity.id;
//     const razorpayOrderId = paymentEntity.order_id;
//     const notes = paymentEntity.notes || {};

//     const planId = notes.planId;
//     const userId = notes.userId;

//     if (!planId || !userId) {
//       console.error("❌ Missing planId/userId in Razorpay notes");
//       return new Response("Missing metadata", { status: 400 });
//     }

//     // 🔁 Idempotency: skip if already processed
//     const existing = await prisma.payment.findUnique({
//       where: { providerTxnId: razorpayPaymentId },
//     });

//     if (existing?.status === "SUCCESS") {
//       return new Response("Already processed", { status: 200 });
//     }

//     const plan = await prisma.plan.findUnique({
//       where: { id: planId },
//     });

//     if (!plan) {
//       console.error("❌ Plan not found:", planId);
//       return new Response("Plan not found", { status: 404 });
//     }

//     await prisma.$transaction([
//       // 1️⃣ Upsert payment
//       prisma.payment.upsert({
//         where: { providerTxnId: razorpayPaymentId },
//         update: {
//           status: "SUCCESS",
//         },
//         create: {
//           userId,
//           amount: paymentEntity.amount,
//           currency: paymentEntity.currency,
//           status: "SUCCESS",
//           provider: "razorpay",
//           providerTxnId: razorpayPaymentId,
//         },
//       }),

//       // 2️⃣ Expire old subscriptions
//       prisma.subscription.updateMany({
//         where: { userId, status: "ACTIVE" },
//         data: { status: "EXPIRED" },
//       }),

//       // 3️⃣ Create new subscription
//       prisma.subscription.create({
//         data: {
//           userId,
//           planId: plan.id,
//           status: "ACTIVE",

//           startedAt: new Date(),
//           endsAt: new Date(Date.now() + 30 * 86400000),

//           periodStart: new Date(),
//           periodIntervalDays: 30,
//           billingInterval: "monthly",

//           tokensRemaining: plan.maxTokens!,
//           provider: "razorpay",
//           providerSubscriptionId: razorpayOrderId,
//         },
//       }),
//     ]);
//   }

//   /* ============================
//      PAYMENT FAILED
//   ============================ */
//   if (event.event === "payment.failed") {
//     const paymentEntity = event.payload.payment.entity;

//     await prisma.payment.updateMany({
//       where: { providerTxnId: paymentEntity.id },
//       data: { status: "FAILED" },
//     });
//   }

//   return new Response("OK", { status: 200 });
// }
