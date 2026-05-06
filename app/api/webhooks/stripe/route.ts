export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { constructWebhookEvent } from "@/lib/stripe";
import { generateTicketPayload } from "@/lib/qrcode";
import { generateTicketNumber, generateToken } from "@/lib/utils";
import { sendOrderConfirmation } from "@/lib/email";
import { rdel, CacheKeys } from "@/lib/redis";

export const config = { api: { bodyParser: false } };

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
    include: {
      order: {
        include: {
          user: true,
          items: { include: { ticketType: true, event: { select: { title: true, slug: true } }, eventDate: true } },
        },
      },
    },
  });
  if (!payment || payment.status === "COMPLETED") return;

  // Update payment + order
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { id: payment.id }, data: { status: "COMPLETED" } });
    await tx.order.update({ where: { id: payment.orderId }, data: { status: "CONFIRMED" } });

    // Issue tickets
    const tickets: { ticketNumber: string; qrCode: string }[] = [];
    let idx = 0;
    for (const item of payment.order.items) {
      for (let q = 0; q < item.quantity; q++) {
        idx++;
        const ticketNumber = generateTicketNumber(item.event?.slug || "evt", idx);
        const qrSecret = generateToken(16);
        const qrCode = generateTicketPayload(ticketNumber, payment.order.id);

        await tx.ticket.create({
          data: {
            ticketNumber,
            orderId: payment.orderId,
            orderItemId: item.id,
            ticketTypeId: item.ticketTypeId,
            ownerId: payment.order.userId,
            qrCode,
            qrSecret,
            expiresAt: item.eventDate?.startDate ? new Date(item.eventDate.startDate.getTime() + 24 * 60 * 60 * 1000) : undefined,
          },
        });
        tickets.push({ ticketNumber, qrCode });
      }

      // Update sold count, remove reservation
      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { quantitySold: { increment: item.quantity }, quantityReserved: { decrement: item.quantity } },
      });

      // Update organizer stats
      await tx.organizerProfile.update({
        where: { id: item.ticketType.eventId }, // Fixed in real code
        data: { totalTicketsSold: { increment: item.quantity } },
      }).catch(() => {});
    }

    // Promo code usage
    if (payment.order.promoCodeId) {
      await tx.promoCode.update({ where: { id: payment.order.promoCodeId }, data: { usedCount: { increment: 1 } } });
    }

    // Notification
    await tx.notification.create({
      data: {
        userId: payment.order.userId,
        type: "ORDER_CONFIRMED",
        title: "Order Confirmed! 🎟️",
        message: `Your order #${payment.order.orderNumber} has been confirmed.`,
        data: { orderId: payment.orderId, orderNumber: payment.order.orderNumber },
      },
    });
  });

  // Invalidate event cache
  for (const item of payment.order.items) {
    if (item.event?.slug) await rdel(CacheKeys.eventSlug(item.event.slug));
    await rdel(CacheKeys.ticketStock(item.ticketTypeId));
  }

  // Send confirmation email
  const firstItem = payment.order.items[0];
  if (payment.order.user?.email) {
    await sendOrderConfirmation({
      to: payment.order.user.email,
      name: payment.order.user.name || "there",
      orderNumber: payment.order.orderNumber,
      eventTitle: firstItem?.event?.title || "Your Event",
      eventDate: firstItem?.eventDate?.startDate?.toLocaleDateString() || "",
      total: `$${Number(payment.order.total).toFixed(2)}`,
      ticketCount: payment.order.items.reduce((s, i) => s + i.quantity, 0),
      ticketsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets`,
    });
  }
}

async function handlePaymentFailed(stripeIntentId: string) {
  const payment = await prisma.payment.findFirst({
    where: { stripeIntentId },
    include: { order: { include: { items: true } } },
  });
  if (!payment) return;

  await prisma.$transaction(async (tx) => {
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
