import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { verifyTicketPayload } from "@/lib/qrcode";
import { auth } from "@/lib/auth";
import { hasRole } from "@/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);
  if (!hasRole(session.user.role, "STAFF_SCANNER", "ADMIN", "SUPER_ADMIN")) {
    return apiError("Forbidden: Scanner role required", 403);
  }

  const { qrCode } = await req.json();
  if (!qrCode) return apiError("QR code required", 400);

  const verified = verifyTicketPayload(qrCode);
  if (!verified.valid) return apiError("Invalid QR code", 400);

  const ticket = await prisma.ticket.findUnique({
    where: { qrCode },
    include: {
      ticketType: { select: { name: true, category: true } },
      owner: { select: { name: true, email: true } },
      order: {
        include: {
          items: {
            take: 1,
            include: {
              event: { select: { title: true } },
              eventDate: { select: { startDate: true, endDate: true } },
            },
          },
        },
      },
    },
  });

  if (!ticket) return apiError("Ticket not found", 404);

  // Record scan attempt regardless of outcome
  await prisma.scan.create({
    data: {
      ticketId: ticket.id,
      staffId: session.user.id,
      result: ticket.status === "VALID",
      message: ticket.status === "VALID" ? "Valid entry" : `Ticket status: ${ticket.status}`,
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
    },
  });

  if (ticket.status === "USED") {
    return apiSuccess({ valid: false, reason: "Ticket already used", ticket, usedAt: ticket.usedAt }, 200);
  }
  if (ticket.status !== "VALID") {
    return apiSuccess({ valid: false, reason: `Ticket is ${ticket.status}`, ticket }, 200);
  }

  // Mark as used
  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { status: "USED", usedAt: new Date(), usedByStaff: session.user.id },
  });

  return apiSuccess({
    valid: true,
    ticket: {
      ticketNumber: ticket.ticketNumber,
      holderName: ticket.owner.name,
      ticketType: ticket.ticketType.name,
      event: ticket.order.items[0]?.event?.title,
      eventDate: ticket.order.items[0]?.eventDate?.startDate,
    },
  });
}
