import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
  Ticket, Calendar, Heart, Zap, 
  ArrowRight, CreditCard, Bell, 
  ShieldCheck, Clock
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, formatDateShort } from "@/lib/utils";

export default async function DashboardOverview() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fetch some customer data
  const [tickets, orders, favorites] = await Promise.all([
    prisma.ticket.findMany({
      where: { order: { userId: session.user.id } },
      include: { 
        ticketType: { select: { name: true } },
        order: { include: { items: { include: { event: { select: { title: true, images: true } }, eventDate: true } } } }
      },
      take: 2,
      orderBy: { createdAt: "desc" }
    }),
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.favorite.count({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {session.user.name} 👋</h1>
          <p className="text-secondary">Here's a quick look at your upcoming experiences.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/events" className="btn-primary py-2.5 px-6 text-sm">
            Discover Events
          </Link>
          <Link href="/dashboard/tickets" className="btn-ghost py-2.5 px-6 text-sm border border-white/10">
            My Tickets
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Ticket className="w-5 h-5" />} label="Active Tickets" value={tickets.length} color="text-indigo-400" />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Past Orders" value={orders} color="text-emerald-400" />
        <StatCard icon={<Heart className="w-5 h-5" />} label="Favorites" value={favorites} color="text-pink-400" />
        <StatCard icon={<Zap className="w-5 h-5" />} label="Rewards Points" value="1,240" color="text-amber-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Tickets */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Upcoming Tickets</h2>
            <Link href="/dashboard/tickets" className="text-sm text-indigo-400 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {tickets.length === 0 ? (
            <div className="card p-12 text-center bg-white/[0.02]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-8 h-8 text-muted" />
              </div>
              <h3 className="font-bold mb-1">No upcoming events</h3>
              <p className="text-sm text-secondary mb-6">You don't have any active tickets right now.</p>
              <Link href="/events" className="btn-primary py-2.5 px-8 text-sm">Find something fun</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((t) => {
                const item = t.order.items[0];
                return (
                  <Link key={t.id} href="/dashboard/tickets" className="card group overflow-hidden">
                    <div className="relative h-40">
                      <Image 
                        src={item.event.images[0] || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"} 
                        fill className="object-cover group-hover:scale-105 transition-transform" 
                        alt="Event" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="badge badge-brand text-[10px]">{t.ticketType.name}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold mb-2 line-clamp-1">{item.event.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-secondary">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDateShort(item.eventDate.startDate)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Quick Links</h2>
          <div className="card p-2">
            <QuickLink href="/dashboard/profile" icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />} label="Privacy Settings" desc="Manage your data" />
            <QuickLink href="/dashboard/tickets" icon={<Bell className="w-5 h-5 text-indigo-400" />} label="Notifications" desc="Order updates" />
            <QuickLink href="/support" icon={<CreditCard className="w-5 h-5 text-amber-400" />} label="Payment Methods" desc="Manage cards" />
          </div>

          {/* Promo card */}
          <div className="card p-6 bg-gradient-to-br from-indigo-600 to-purple-700 border-none relative overflow-hidden">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <Zap className="w-8 h-8 text-white mb-4" />
            <h3 className="text-white font-bold mb-2">Refer a Friend</h3>
            <p className="text-white/80 text-xs mb-4 leading-relaxed">Give $10, get $10. Share your unique referral link and earn credits for your next show.</p>
            <button className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors">Copy Link</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="card p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-secondary mb-0.5">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, icon, label, desc }: { href: string; icon: React.ReactNode; label: string; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold group-hover:text-indigo-400 transition-colors">{label}</p>
        <p className="text-[10px] text-muted">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted/30 group-hover:text-white transition-all" />
    </Link>
  );
}
