export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { auth } from "@/lib/auth";

// GET /api/admin/orders — list orders for manual payment management
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUPPORT_AGENT")) {
    return apiError("Unauthorized", 403);
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status"); // e.g. PENDING, FAILED, CONFIRMED
  const paymentFilter = searchParams.get("payment"); // e.g. PENDING, FAILED
  const search = searchParams.get("q") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 25;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (statusFilter && statusFilter !== "ALL") where.status = statusFilter;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (paymentFilter && paymentFilter !== "ALL") {
    where.payment = { status: paymentFilter };
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        payment: { select: { id: true, status: true, provider: true, isManualPayment: true, manualPaymentRef: true } },
        items: {
          take: 1,
          include: {
            event: { select: { title: true } },
          },
        },
        _count: { select: { tickets: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return apiSuccess({ orders, total, page, totalPages: Math.ceil(total / limit) });
}
