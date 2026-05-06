export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

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
