import { prisma } from "@/lib/prisma";
import { ArrowRight, Music, Mic, Ghost, Ticket, Trophy, Theater, Palette, Utensils } from "lucide-react";
import Link from "next/link";

const ICON_MAP: Record<string, any> = {
  music: Music,
  sports: Trophy,
  theatre: Theater,
  comedy: Mic,
  festivals: Ghost,
  arts: Palette,
  food: Utensils,
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { events: { where: { status: "PUBLISHED" } } } }
    },
    orderBy: { name: "asc" }
  });

  return (
    <div className="container py-24">
      <div className="max-w-2xl mb-16">
        <h1 className="text-4xl font-bold mb-4">Categories</h1>
        <p className="text-secondary text-lg">Browse events by category to find exactly what you're looking for.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.slug] || Ticket;
          return (
            <Link 
              key={cat.id} 
              href={`/events?category=${cat.slug}`}
              className="card p-8 flex flex-col items-center text-center hover:border-indigo-500/40 transition-all group"
            >
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                style={{ background: `${cat.color}15` }}
              >
                <Icon className="w-8 h-8" style={{ color: cat.color }} />
              </div>
              <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
              <p className="text-sm text-muted mb-6">{cat._count.events} Events</p>
              <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
