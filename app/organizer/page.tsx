"use client";
import { useState, useEffect } from "react";
import { 
  TrendingUp, Users, Ticket, DollarSign, 
  Calendar, ArrowUpRight, BarChart3, Plus 
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, formatNumber } from "@/lib/utils";
import Link from "next/link";

interface Stats {
  totalRevenue: number;
  totalTicketsSold: number;
  activeEvents: number;
  conversionRate: number;
}

export default function OrganizerDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/organizer/stats")
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container py-20 text-center">Loading dashboard...</div>;

  const { stats, events } = data;

  const statCards = [
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Tickets Sold", value: formatNumber(stats.totalTicketsSold), icon: Ticket, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Active Events", value: stats.activeEvents, icon: Calendar, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
          <p className="text-secondary">Welcome back! Here's how your events are performing.</p>
        </div>
        <Link href="/organizer/events/new" className="btn-primary py-3 px-6 gap-2">
          <Plus className="w-5 h-5" /> Create New Event
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-6"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Your Events</h2>
              <Link href="/organizer/events" className="text-sm text-indigo-400 flex items-center gap-1 hover:underline">
                View all <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-muted uppercase text-[10px] font-bold tracking-wider">
                    <th className="pb-4">Event</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Tickets</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-muted">No events created yet.</td></tr>
                  ) : (
                    events.map((event: any) => (
                      <tr key={event.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-4 font-semibold">{event.name}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            event.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-400" :
                            event.status === "DRAFT" ? "bg-white/10 text-muted" :
                            "bg-amber-500/10 text-amber-400"
                          }`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="py-4 text-secondary">{event.sold} sold</td>
                        <td className="py-4 text-right">
                          <Link href={`/organizer/events/${event.id}/edit`} className="text-xs text-indigo-400 hover:underline">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6">Quick Links</h2>
            <div className="flex flex-col gap-3">
              <Link href="/organizer/payouts" className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center text-sm font-medium">
                Payout Settings <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link href="/support" className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex justify-between items-center text-sm font-medium">
                Contact Support <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
