export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, getPaginationParams, buildPaginationMeta } from "@/lib/utils";
import { rget, rset, CacheKeys } from "@/lib/redis";
import { checkRateLimit } from "@/lib/redis";

const EVENT_INCLUDE = {
  venue: { select: { name: true, city: true, country: true } },
  category: { select: { name: true, slug: true, color: true } },
  dates: { take: 1, orderBy: { startDate: "asc" as const } },
  ticketTypes: { where: { isVisible: true }, select: { price: true, name: true, quantity: true, quantitySold: true } },
  organizer: { select: { organizationName: true, slug: true, isVerified: true, logo: true } },
  _count: { select: { favorites: true, reviews: true } },
};

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rl = await checkRateLimit(`events:${ip}`, 60, 60);
  if (!rl.success) return apiError("Rate limit exceeded", 429);

  const sp = req.nextUrl.searchParams;
  const { page, limit, skip } = getPaginationParams(sp);

  const query = sp.get("q") || "";
  const category = sp.get("category") || "";
  const city = sp.get("city") || "";
  const sortBy = sp.get("sort") || "date";
  const featured = sp.get("featured") === "true";
  const trending = sp.get("trending") === "true";
  const minPrice = sp.get("minPrice") ? parseFloat(sp.get("minPrice")!) : undefined;
  const maxPrice = sp.get("maxPrice") ? parseFloat(sp.get("maxPrice")!) : undefined;

  // Cache simple listing pages
  const cacheKey = CacheKeys.events(page);
  if (!query && !category && !city && !featured && !trending && page <= 3) {
    const cached = await rget(cacheKey);
    if (cached) return apiSuccess(cached);
  }

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (query) where.title = { contains: query, mode: "insensitive" };
  if (category) where.category = { slug: category };
  if (city) where.venue = { city: { contains: city, mode: "insensitive" } };
  if (featured) where.isFeatured = true;
  if (trending) where.isTrending = true;
  if (minPrice || maxPrice) {
    where.ticketTypes = {
      some: {
        price: {
          ...(minPrice ? { gte: minPrice } : {}),
          ...(maxPrice ? { lte: maxPrice } : {}),
        },
      },
    };
  }

  const orderBy: Record<string, unknown> =
    sortBy === "trending" ? { totalSales: "desc" } :
    sortBy === "price_asc" ? { ticketTypes: { _count: "asc" } } :
    { dates: { _min: { startDate: "asc" } } };

  const [events, total] = await Promise.all([
    prisma.event.findMany({ where, include: EVENT_INCLUDE, orderBy, skip, take: limit }),
    prisma.event.count({ where }),
  ]);

  const result = { events, meta: buildPaginationMeta(total, page, limit) };

  // Cache the first few pages for 5 minutes
  if (!query && !category && !city && page <= 3) {
    await rset(cacheKey, result, 300);
  }

  return apiSuccess(result);
}
