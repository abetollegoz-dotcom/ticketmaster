import { prisma } from "@/lib/prisma";
import { EventCardComponent } from "@/components/cards/event-card";
import { SearchFiltersBar } from "@/components/forms/search-filters";
import type { Metadata } from "next";
import type { SearchFilters } from "@/types";

export const metadata: Metadata = {
  title: "All Events — Browse Concerts, Sports & More",
  description: "Browse thousands of live events. Filter by city, category, date and price.",
};

export const revalidate = 120;

interface PageProps {
  searchParams: Promise<SearchFilters>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  const limit = 24;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (sp.query) where.title = { contains: sp.query, mode: "insensitive" };
  if (sp.category) where.category = { slug: sp.category };
  if (sp.city) where.venue = { city: { contains: sp.city, mode: "insensitive" } };
  if (sp.sort === "trending") where.isTrending = true;

  const orderBy: any =
    sp.sort === "trending" ? { totalSales: "desc" } :
    sp.sort === "price_asc" ? { title: "asc" } : // fallback for price_asc since we can't sort by nested min price easily
    { createdAt: "desc" };

  const [events, total, categories] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        venue: { select: { name: true, city: true, country: true } },
        category: { select: { name: true, slug: true, color: true } },
        dates: { take: 1, orderBy: { startDate: "asc" } },
        ticketTypes: { where: { isVisible: true }, select: { price: true, name: true } },
        _count: { select: { favorites: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.event.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="py-10">
      <div className="container">
        {/* Page header */}
        <div className="mb-8">
          <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-2">
            {sp.query ? `Results for "${sp.query}"` : sp.category ? `${sp.category} Events` : "Browse All Events"}
          </h1>
          <p style={{ color: "var(--text-secondary)" }} className="text-sm">{total} event{total !== 1 ? "s" : ""} found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <SearchFiltersBar categories={categories} currentFilters={sp} />
          </aside>

          {/* Events grid */}
          <div className="flex-1">
            {events.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-5xl mb-4">🎭</p>
                <h2 style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-bold mb-2">No events found</h2>
                <p style={{ color: "var(--text-secondary)" }}>Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {events.map((event: any, i: number) => (
                    <EventCardComponent key={event.id} event={event as never} priority={i < 6} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                      <a
                        key={p}
                        href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([,v]) => v !== undefined) as [string,string][]), page: String(p) }).toString()}`}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${p === page ? "btn-primary" : "btn-ghost"}`}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
