import { prisma } from "./prisma";
import { generateTicketNumber, generateToken } from "./utils";
import { generateTicketPayload } from "./qrcode";
import { sendOrderConfirmation } from "./email";

/**
 * Shared logic to issue tickets for an order, update stock, and notify the user.
 * Used by both Stripe Webhooks and Admin Manual Approval.
 */
export async function issueTicketsForOrder(orderId: string) {
  // 1. Fetch full order details
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: { 
        include: { 
          ticketType: true, 
          event: { select: { title: true, slug: true, id: true } }, 
          eventDate: { select: { startDate: true } } 
        } 
      },
      payment: true,
    },
  });

  if (!order) throw new Error("Order not found");
  if (order.status === "CONFIRMED") {
    // Check if tickets already exist to avoid double issuance
    const existingCount = await prisma.ticket.count({ where: { orderId } });
    if (existingCount > 0) return order;
  }

  await prisma.$transaction(async (tx: any) => {
    // 2. Update statuses
    await tx.order.update({ where: { id: orderId }, data: { status: "CONFIRMED" } });
    if (order.payment) {
      await tx.payment.update({ where: { orderId }, data: { status: "COMPLETED" } });
    }

    // 3. Issue individual tickets
    let globalIdx = 0;
    for (const item of order.items) {
      for (let q = 0; q < item.quantity; q++) {
        globalIdx++;
        const ticketNumber = generateTicketNumber(item.event?.slug || "evt", globalIdx);
        const qrSecret = generateToken(16);
        // Payload: ticketNumber:orderId (matches scanner expectation)
        const qrCode = generateTicketPayload(ticketNumber, orderId);

        await tx.ticket.create({
          data: {
            ticketNumber,
            orderId,
            orderItemId: item.id,
            ticketTypeId: item.ticketTypeId,
            ownerId: order.userId,
            qrCode,
            qrSecret,
            status: "VALID", // Manual approval issues valid tickets by default
            expiresAt: item.eventDate?.startDate ? new Date(new Date(item.eventDate.startDate).getTime() + 24 * 60 * 60 * 1000) : undefined,
          },
        });
      }

      // 4. Update stock counts
      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { 
          quantitySold: { increment: item.quantity }, 
          quantityReserved: { decrement: item.quantity } 
        },
      });

      // 5. Update organizer totals
      if (item.event?.id) {
        // Attempt to find the organizer profile associated with the event
        const eventData = await tx.event.findUnique({
          where: { id: item.event.id },
          select: { organizerId: true }
        });
        if (eventData?.organizerId) {
          await tx.organizerProfile.update({
            where: { id: eventData.organizerId },
            data: { 
              totalTicketsSold: { increment: item.quantity },
              totalRevenue: { increment: item.totalPrice }
            },
          }).catch(() => {});
        }
      }
    }

    // 6. Handle promo code usage
    if (order.promoCodeId) {
      await tx.promoCode.update({ 
        where: { id: order.promoCodeId }, 
        data: { usedCount: { increment: 1 } } 
      });
    }

    // 7. Create notification
    await tx.notification.create({
      data: {
        userId: order.userId,
        type: "ORDER_CONFIRMED",
        title: "Tickets Issued! 🎟️",
        message: `Your order #${order.orderNumber} has been confirmed and tickets are ready.`,
        data: { orderId, orderNumber: order.orderNumber },
      },
    });
  });

  // 8. Send confirmation email (outside transaction)
  const firstItem = order.items[0];
  if (order.user?.email) {
    await sendOrderConfirmation({
      to: order.user.email,
      name: order.user.name || "there",
      orderNumber: order.orderNumber,
      eventTitle: firstItem?.event?.title || "Your Event",
      eventDate: firstItem?.eventDate?.startDate ? new Date(firstItem.eventDate.startDate).toLocaleDateString() : "TBD",
      total: `$${Number(order.total).toFixed(2)}`,
      ticketCount: order.items.reduce((s, i) => s + i.quantity, 0),
      ticketsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tickets`,
    }).catch(err => console.error("Email failed:", err));
  }

  return prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, tickets: true, items: true, user: true }
  });
}
