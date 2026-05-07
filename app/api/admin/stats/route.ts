import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return apiError("Unauthorized", 403);
  }

  const [totalRevenue, totalUsers, totalEvents, pendingEvents, fraudAlerts] = await Promise.all([
    prisma.order.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { total: true },
    }),
    prisma.user.count(),
    prisma.event.count(),
    prisma.event.findMany({
      where: { status: "PENDING_APPROVAL" },
      include: { organizer: true },
      orderBy: { createdAt: "desc" },
    }),
    // Fraud logic mock: duplicate scans or high-velocity failed payments
    prisma.scan.count({ where: { result: false } }),
  ]);

  return apiSuccess({
    stats: {
      gmv: Number(totalRevenue._sum.total || 0),
      platformRevenue: Number(totalRevenue._sum.total || 0) * 0.05, // 5% fee mock
      totalUsers,
      totalEvents,
      fraudAlerts,
    },
    pendingEvents: pendingEvents.map(e => ({
      id: e.id,
      name: e.title,
      org: e.organizer.organizationName,
      status: e.status,
      date: e.createdAt.toLocaleDateString(),
    })),
  });
}
