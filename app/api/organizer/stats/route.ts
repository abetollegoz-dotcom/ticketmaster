import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const isOrganizer = session?.user?.role === "ORGANIZER";

  if (!session?.user || (!isAdmin && !isOrganizer)) {
    return apiError("Unauthorized", 403);
  }

  const profile = await prisma.organizerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    // Return empty state instead of error
    return apiSuccess({
      stats: { totalRevenue: 0, totalTicketsSold: 0, activeEvents: 0, conversionRate: 0 },
      events: []
    });
  }

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
