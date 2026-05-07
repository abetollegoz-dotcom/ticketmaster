export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

// PATCH /api/admin/orders/[id]/tickets/[ticketId] — approve / reject / pending a single ticket
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPPORT_AGENT")) {
    return apiError("Unauthorized", 403);
  }

  const { id, ticketId } = await params;
  const body = await req.json();
  const { status } = body; // "VALID" | "CANCELLED" | "EXPIRED"

  const validStatuses = ["VALID", "CANCELLED", "EXPIRED"];
  if (!validStatuses.includes(status)) {
    return apiError("Invalid ticket status. Must be VALID, CANCELLED, or EXPIRED", 400);
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId, orderId: id },
  });

  if (!ticket) return apiError("Ticket not found", 404);

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: status as any },
    include: {
      ticketType: { select: { name: true, category: true } },
      owner: { select: { name: true, email: true } },
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: `ticket_status_${status.toLowerCase()}`,
      resource: "Ticket",
      resourceId: ticketId,
      newData: { status, orderId: id },
    },
  });

  return apiSuccess(updated);
}
