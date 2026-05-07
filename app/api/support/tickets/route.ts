export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiError("Unauthorized", 401);
  }

  const isStaff = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes(session.user.role);
  
  // If staff, return all tickets. If customer, return only their tickets.
  const tickets = await prisma.supportTicket.findMany({
    where: isStaff ? {} : { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return apiSuccess(tickets);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiError("Unauthorized", 401);
  }

  const body = await req.json();
  const { subject, message, priority, category, orderId } = body;

  if (!subject || !message) {
    return apiError("Missing required fields", 400);
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      userId: session.user.id,
      subject,
      message,
      priority: priority || "MEDIUM",
      category: category || "General",
      orderId: orderId || null,
      status: "OPEN",
    },
  });

  return apiSuccess(ticket);
}
