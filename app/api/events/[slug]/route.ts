export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/utils";
import { rget, rset, CacheKeys } from "@/lib/redis";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const cached = await rget(CacheKeys.eventSlug(slug));
  if (cached) return apiSuccess(cached);

  const event = await prisma.event.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      venue: true,
      category: true,
      dates: { orderBy: { startDate: "asc" } },
      ticketTypes: { where: { isVisible: true }, orderBy: { sortOrder: "asc" } },
      organizer: { include: { user: { select: { name: true, image: true } } } },
      reviews: {
        where: { isVisible: true },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      pricingRules: { where: { isActive: true } },
      _count: { select: { favorites: true, reviews: true } },
    },
  });

  if (!event) return apiError("Event not found", 404);

  // Increment view count (fire and forget)
  prisma.event.update({ where: { id: event.id }, data: { totalViews: { increment: 1 } } }).catch(() => {});

  await rset(CacheKeys.eventSlug(slug), event, 300);
  return apiSuccess(event);
}
