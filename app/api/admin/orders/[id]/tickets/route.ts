export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

// GET /api/admin/orders/[id]/tickets — list tickets for an order
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPPORT_AGENT")) {
    return apiError("Unauthorized", 403);
  }

  const { id } = await params;
  const tickets = await prisma.ticket.findMany({
    where: { orderId: id },
    include: {
      ticketType: { select: { name: true, category: true } },
      owner: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return apiSuccess(tickets);
}

// PATCH /api/admin/orders/[id]/tickets — bulk update ticket statuses
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
  const { action } = body; // "APPROVE_ALL" | "REJECT_ALL" | "PENDING_ALL"

  const statusMap: Record<string, string> = {
    APPROVE_ALL: "VALID",
    REJECT_ALL: "CANCELLED",
    PENDING_ALL: "VALID", // keep VALID but we track via order status
  };

  if (!statusMap[action]) return apiError("Invalid action", 400);

  await prisma.ticket.updateMany({
    where: { orderId: id },
    data: { status: statusMap[action] as any },
  });

  return apiSuccess({ message: `All tickets ${action.toLowerCase().replace("_all", "d")}` });
}
