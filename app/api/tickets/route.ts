export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { generateTicketPayload } from "@/lib/qrcode";
import { sendTicketTransferEmail } from "@/lib/email";
import { generateToken } from "@/lib/utils";
import { z } from "zod";

// GET /api/tickets — list user's tickets
export async function GET() {
  console.log("[Tickets API] GET request received");
  const session = await auth();
  console.log("[Tickets API] Session:", session?.user?.email || "No session");
  if (!session?.user) return apiError("Unauthorized", 401);

  const tickets = await prisma.ticket.findMany({
    where: { ownerId: session.user.id },
    include: {
      ticketType: { select: { name: true, category: true } },
      order: {
        select: {
          orderNumber: true,
          createdAt: true,
          items: {
            take: 1,
            include: {
              event: { select: { title: true, slug: true, images: true } },
              eventDate: { select: { startDate: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(tickets);
}

// POST /api/tickets/transfer
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const body = await req.json();
  const parsed = z.object({ ticketId: z.string(), recipientEmail: z.string().email() }).safeParse(body);
  if (!parsed.success) return apiError("Invalid request", 400);

  const { ticketId, recipientEmail } = parsed.data;

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId, ownerId: session.user.id, status: "VALID" },
    include: {
      order: {
        include: {
          items: {
            include: {
              event: { select: { title: true } },
              eventDate: { select: { startDate: true } },
            },
          },
        },
      },
    },
  });

  if (!ticket) return apiError("Ticket not found or not eligible for transfer", 404);

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

  await prisma.transfer.create({
    data: {
      ticketId: ticket.id,
      senderId: session.user.id,
      email: recipientEmail,
      token,
      expiresAt,
    },
  });

  await prisma.ticket.update({ where: { id: ticketId }, data: { status: "TRANSFERRED" } });

  const eventItem = ticket.order.items[0];
  await sendTicketTransferEmail({
    to: recipientEmail,
    senderName: session.user.name || "Someone",
    eventTitle: eventItem?.event?.title || "Event",
    eventDate: eventItem?.eventDate?.startDate?.toLocaleDateString() || "",
    acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/accept/${token}`,
  });

  return apiSuccess({ message: "Transfer initiated successfully" });
}
