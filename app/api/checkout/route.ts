export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, toCents, PLATFORM_FEE_PERCENT } from "@/lib/stripe";
import { apiSuccess, apiError, generateOrderNumber, calculateTax, calculateServiceFee } from "@/lib/utils";
import { z } from "zod";

const CheckoutSchema = z.object({
  items: z.array(z.object({
    ticketTypeId: z.string(),
    eventId: z.string(),
    eventDateId: z.string().optional(),
    quantity: z.number().min(1).max(20),
  })).min(1),
  promoCode: z.string().optional(),
  upsells: z.array(z.object({ name: z.string(), price: z.number(), quantity: z.number() })).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const body = await req.json();
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.message, 400);

  const { items, promoCode, upsells = [] } = parsed.data;

  // Validate ticket types and stock
  const ticketTypes = await prisma.ticketType.findMany({
    where: { id: { in: items.map(i => i.ticketTypeId) } },
    include: { event: { select: { title: true, slug: true, status: true } } },
  });

  if (ticketTypes.length !== items.length) return apiError("One or more ticket types not found", 404);

  for (const item of items) {
    const tt = ticketTypes.find((t: any) => t.id === item.ticketTypeId);
    if (!tt) return apiError("Ticket type not found", 404);
    if (tt.event.status !== "PUBLISHED") return apiError(`Event "${tt.event.title}" is not available`, 400);
    const available = tt.quantity - tt.quantitySold - tt.quantityReserved;
    if (item.quantity > available) return apiError(`Only ${available} tickets available for "${tt.name}"`, 400);
    if (item.quantity < tt.minPerOrder) return apiError(`Minimum ${tt.minPerOrder} tickets required for "${tt.name}"`, 400);
    if (item.quantity > tt.maxPerOrder) return apiError(`Maximum ${tt.maxPerOrder} tickets per order for "${tt.name}"`, 400);
  }

  // Calculate totals
  let subtotal = 0;
  for (const item of items) {
    const tt = ticketTypes.find((t: any) => t.id === item.ticketTypeId)!;
    subtotal += Number(tt.price) * item.quantity;
  }
  for (const u of upsells) subtotal += u.price * u.quantity;

  // Apply promo code
  let promoDiscount = 0;
  let promoCodeRecord = null;
  if (promoCode) {
    promoCodeRecord = await prisma.promoCode.findUnique({
      where: { code: promoCode.toUpperCase(), isActive: true },
    });
    if (promoCodeRecord) {
      const now = new Date();
      const expired = promoCodeRecord.expiresAt && promoCodeRecord.expiresAt < now;
      const maxUsed = promoCodeRecord.maxUses && promoCodeRecord.usedCount >= promoCodeRecord.maxUses;
      if (!expired && !maxUsed) {
        if (promoCodeRecord.type === "PERCENTAGE") promoDiscount = subtotal * (Number(promoCodeRecord.amount) / 100);
        else if (promoCodeRecord.type === "FIXED_AMOUNT") promoDiscount = Number(promoCodeRecord.amount);
        promoDiscount = Math.min(promoDiscount, subtotal);
      }
    }
  }

  const discounted = subtotal - promoDiscount;
  const serviceFee = calculateServiceFee(discounted, PLATFORM_FEE_PERCENT / 100);
  const taxAmount = calculateTax(discounted);
  const total = discounted + serviceFee + taxAmount;

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: toCents(total),
    currency: "usd",
    metadata: { userId: session.user.id, orderRef: generateOrderNumber() },
    automatic_payment_methods: { enabled: true },
  });

  // Create pending order
  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session.user.id,
      status: "PENDING",
      subtotal,
      discount: promoDiscount,
      promoCodeId: promoCodeRecord?.id,
      promoDiscount,
      serviceFee,
      taxAmount,
      total,
      currency: "USD",
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      items: {
        create: items.map(item => {
          const tt = ticketTypes.find((t: any) => t.id === item.ticketTypeId)!;
          return {
            eventId: item.eventId,
            eventDateId: item.eventDateId,
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
            unitPrice: tt.price,
            totalPrice: Number(tt.price) * item.quantity,
          };
        }),
      },
      upsells: upsells.length ? { create: upsells.map(u => ({ name: u.name, price: u.price, quantity: u.quantity })) } : undefined,
      payment: {
        create: {
          provider: "STRIPE",
          status: "PENDING",
          amount: total,
          currency: "USD",
          stripeIntentId: paymentIntent.id,
        },
      },
    },
  });

  // Reserve stock
  await Promise.all(items.map((item: any) =>
    prisma.ticketType.update({
      where: { id: item.ticketTypeId },
      data: { quantityReserved: { increment: item.quantity } },
    })
  ));

  return apiSuccess({
    orderId: order.id,
    orderNumber: order.orderNumber,
    clientSecret: paymentIntent.client_secret,
    total,
    subtotal,
    promoDiscount,
    serviceFee,
    taxAmount,
  });
}
