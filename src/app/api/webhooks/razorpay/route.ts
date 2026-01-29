import crypto from "crypto";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

function verifySignature(body: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  return expected === signature;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("x-razorpay-signature");

  if (!signature || !verifySignature(body, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);

  /* =======================
     PAYMENT SUCCESS
  ======================= */
  if (event.event === "payment.captured") {
    const paymentEntity = event.payload.payment.entity;
    const orderId = paymentEntity.order_id;

    const payment = await prisma.payment.findFirst({
      where: { providerTxnId: orderId },
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

  /* =======================
     PAYMENT FAILED
  ======================= */
  if (event.event === "payment.failed") {
    const paymentEntity = event.payload.payment.entity;

    await prisma.payment.updateMany({
      where: { providerTxnId: paymentEntity.order_id },
      data: { status: "FAILED" },
    });
  }

  return new Response("OK", { status: 200 });
}