import { prisma } from "@/lib/prisma";
import { MapPin, ArrowRight, Music, Mic, Ghost, Ticket } from "lucide-react";
import Link from "next/link";

export default async function VenuesPage() {
  const venues = await prisma.venue.findMany({
    include: {
      _count: { select: { events: { where: { status: "PUBLISHED" } } } }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="container py-24">
      <div className="max-w-2xl mb-16">
        <h1 className="text-4xl font-bold mb-4">Venues</h1>
        <p className="text-secondary text-lg">Explore world-class arenas, intimate clubs, and iconic stadiums hosting your favorite events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <Link 
            key={venue.id} 
            href={`/events?venue=${venue.id}`}
            className="card p-6 hover:border-indigo-500/40 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-indigo-500/10 transition-colors">
              <MapPin className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-1">{venue.name}</h3>
            <p className="text-sm text-muted mb-6">{venue.city}, {venue.country}</p>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span className="text-indigo-400">{venue._count.events} Upcoming Events</span>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
