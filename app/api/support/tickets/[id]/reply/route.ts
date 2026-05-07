import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const body = await req.json();
  const { message, status } = body;

  if (!message) return apiError("Message is required", 400);

  const isStaff = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes(session.user.role);

  try {
    const reply = await prisma.$transaction(async (tx) => {
      // 1. Create the reply
      const newReply = await tx.supportTicketReply.create({
        data: {
          ticketId: id,
          authorId: session.user.id,
          message,
          isStaff,
        },
      });

      // 2. Update ticket status if provided or if staff replied
      await tx.supportTicket.update({
        where: { id },
        data: {
          status: status || (isStaff ? "IN_PROGRESS" : "OPEN"),
          agentId: isStaff ? session.user.id : undefined,
          updatedAt: new Date(),
        },
      });

      return newReply;
    });

    return apiSuccess(reply);
  } catch (error: any) {
    return apiError("Failed to send reply", 500);
  }
}
