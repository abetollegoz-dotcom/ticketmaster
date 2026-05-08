export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent } from "@/lib/stripe";
import { generateTicketPayload } from "@/lib/qrcode";
import { generateTicketNumber, generateToken } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/email";
import { rdel, CacheKeys } from "@/lib/redis";
import { issueTicketsForOrder } from "@/lib/orders";



export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  let event: ReturnType<typeof constructWebhookEvent>;
  try {
    event = constructWebhookEvent(body, sig);
  } catch (err) {
    console.error("[Webhook] Invalid signature:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as { id: string };
    await handlePaymentSuccess(intent.id);
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as { id: string };
    await handlePaymentFailed(intent.id);
  }

  return new Response("OK", { status: 200 });
}

async function handlePaymentSuccess(stripeIntentId: string) {
  const payment = await prisma.payment.findFirst({
    where: { stripeIntentId },
  });
  if (!payment || payment.status === "COMPLETED") return;

  // Use centralized logic to issue tickets and update order
  const order = await issueTicketsForOrder(payment.orderId);

  // Invalidate event cache for all items in the order
  if (order && 'items' in order) {
    for (const item of (order as any).items) {
      if (item.event?.slug) await rdel(CacheKeys.eventSlug(item.event.slug));
      await rdel(CacheKeys.ticketStock(item.ticketTypeId));
    }
  }
}

async function handlePaymentFailed(stripeIntentId: string) {
  const payment = await prisma.payment.findFirst({
    where: { stripeIntentId },
    include: { order: { include: { items: true } } },
  });
  if (!payment) return;

  await prisma.$transaction(async (tx: any) => {
    await tx.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    await tx.order.update({ where: { id: payment.orderId }, data: { status: "CANCELLED" } });
    // Release reserved stock
    for (const item of payment.order.items) {
      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { quantityReserved: { decrement: item.quantity } },
      });
    }
  });
}
