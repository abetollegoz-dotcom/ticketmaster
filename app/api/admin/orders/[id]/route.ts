export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { issueTicketsForOrder } from "@/lib/orders";

// GET /api/admin/orders/[id] — get full order detail
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPPORT_AGENT")) {
    return apiError("Unauthorized", 403);
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      payment: true,
      items: {
        include: {
          event: { select: { id: true, title: true, slug: true } },
          eventDate: { select: { startDate: true } },
          ticketType: { select: { name: true, category: true } },
          tickets: true,
        },
      },
      tickets: {
        include: {
          ticketType: { select: { name: true, category: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      refunds: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) return apiError("Order not found", 404);
  return apiSuccess(order);
}

// PATCH /api/admin/orders/[id] — manual payment approval / alternative payment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPPORT_AGENT")) {
    return apiError("Unauthorized", 403);
  }

  const { id } = await params;
  const body = await req.json();
  const {
    orderStatus,         // "CONFIRMED" | "CANCELLED" | "PENDING"
    paymentStatus,       // "COMPLETED" | "FAILED" | "PENDING"
    provider,            // "STRIPE" | "PAYPAL" | "MOLLIE"
    manualPaymentRef,    // e.g. "M-PESA: QWE12345"
    manualPaymentNote,   // admin note for the order
    isManualPayment,     // true/false
  } = body;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { payment: true, tickets: true },
  });

  if (!order) return apiError("Order not found", 404);

  try {
    // If we are confirming a PENDING order, trigger ticket issuance
    if (orderStatus === "CONFIRMED" && order.status !== "CONFIRMED") {
      await issueTicketsForOrder(id);
      // Note: issueTicketsForOrder handles status updates for order and payment too.
    } else {
      // Manual status updates (for non-confirmation cases or just notes)
      const orderUpdate: any = {};
      if (orderStatus) orderUpdate.status = orderStatus;
      if (manualPaymentNote) orderUpdate.manualPaymentNote = manualPaymentNote;

      if (Object.keys(orderUpdate).length > 0) {
        await prisma.order.update({ where: { id }, data: orderUpdate });
      }

      if (paymentStatus || provider || manualPaymentRef !== undefined || isManualPayment !== undefined) {
        const paymentUpdate: any = {};
        if (paymentStatus) paymentUpdate.status = paymentStatus;
        if (provider) paymentUpdate.provider = provider;
        if (manualPaymentRef !== undefined) paymentUpdate.manualPaymentRef = manualPaymentRef;
        if (manualPaymentNote) paymentUpdate.manualPaymentNote = manualPaymentNote;
        if (isManualPayment !== undefined) paymentUpdate.isManualPayment = isManualPayment;

        if (order.payment) {
          await prisma.payment.update({ where: { orderId: id }, data: paymentUpdate });
        } else {
          await prisma.payment.create({
            data: {
              orderId: id,
              provider: provider || "STRIPE",
              amount: order.total,
              currency: order.currency,
              ...paymentUpdate,
            },
          });
        }
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "admin_order_update",
        resource: "Order",
        resourceId: id,
        newData: body,
      },
    });

    // RETURN THE FULL OBJECT to keep frontend in sync
    const updated = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        payment: true,
        items: {
          include: {
            event: { select: { id: true, title: true, slug: true } },
            eventDate: { select: { startDate: true } },
            ticketType: { select: { name: true, category: true } },
            tickets: true,
          },
        },
        tickets: {
          include: {
            ticketType: { select: { name: true, category: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        refunds: { orderBy: { createdAt: "desc" } },
      },
    });

    return apiSuccess(updated);
  } catch (error: any) {
    return apiError("Failed to update order: " + error.message, 500);
  }
}
