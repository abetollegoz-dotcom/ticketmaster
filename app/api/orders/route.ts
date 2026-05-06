export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          event: { select: { title: true, slug: true, images: true } },
          eventDate: { select: { startDate: true } },
          ticketType: { select: { name: true, category: true } },
          tickets: { select: { id: true, ticketNumber: true, status: true, qrCode: true } },
        },
      },
      payment: { select: { status: true, provider: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return apiSuccess(orders);
}
