import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ORGANIZER") {
    return apiError("Unauthorized", 403);
  }

  const profile = await prisma.organizerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) return apiError("Profile not found", 404);

  const [events, totalRevenue] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId: profile.id },
      include: {
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.orderItem.aggregate({
      where: { event: { organizerId: profile.id }, order: { status: "CONFIRMED" } },
      _sum: { totalPrice: true },
    }),
  ]);

  const stats = {
    totalRevenue: Number(totalRevenue._sum.totalPrice || 0),
    totalTicketsSold: events.reduce((acc, e) => acc + e._count.orderItems, 0),
    activeEvents: events.filter(e => e.status === "PUBLISHED").length,
    conversionRate: 12.5, // Mock conversion rate
  };

  return apiSuccess({
    stats,
    events: events.map(e => ({
      id: e.id,
      name: e.title,
      sold: e._count.orderItems,
      revenue: 0, // Simplified for now
      status: e.status,
    })),
  });
}
