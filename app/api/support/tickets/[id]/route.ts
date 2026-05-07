import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const { id } = await params;
  const isStaff = ["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes(session.user.role);

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, image: true } },
      agent: { select: { name: true, image: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          ticket: { select: { subject: true } } // Just for context if needed
        }
      },
    },
  });

  if (!ticket) return apiError("Ticket not found", 404);

  // Check ownership
  if (!isStaff && ticket.userId !== session.user.id) {
    return apiError("Unauthorized", 403);
  }

  return apiSuccess(ticket);
}
