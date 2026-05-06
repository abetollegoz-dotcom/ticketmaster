import { prisma } from "@/lib/prisma";
import { EventCardComponent } from "@/components/cards/event-card";
import { SearchFiltersBar } from "@/components/forms/search-filters";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Results | EventHub Pro",
  description: "Search results for events on EventHub Pro.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; query?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const query = sp.q || sp.query || "";

  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { venue: { city: { contains: query, mode: "insensitive" } } },
        { category: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: {
      venue: { select: { name: true, city: true, country: true } },
      category: { select: { name: true, slug: true, color: true } },
      dates: { take: 1, orderBy: { startDate: "asc" } },
      ticketTypes: { where: { isVisible: true }, select: { price: true, name: true } },
      _count: { select: { favorites: true } },
    },
    take: 24,
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="container py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-[var(--text-muted)]">
          {events.length} results for <span className="text-white font-semibold italic">"{query}"</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <SearchFiltersBar categories={categories} currentFilters={{ q: query }} />
        </aside>

        <main className="lg:col-span-3">
          {events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {events.map((event: any, i: number) => (
                <EventCardComponent key={event.id} event={event as never} priority={i < 6} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h2 className="text-xl font-bold mb-2">No events found</h2>
              <p className="text-[var(--text-muted)] max-w-sm mx-auto mb-8">
                We couldn't find any events matching your search. Try different keywords or browse all events.
              </p>
              <a href="/events" className="btn-primary py-3 px-8">Browse All Events</a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
