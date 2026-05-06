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
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalTicketsSold: 0,
    activeEvents: 0,
    conversionRate: 0
  });

  useEffect(() => {
    // In a real app, fetch from /api/organizer/stats
    setStats({
      totalRevenue: 12450.50,
      totalTicketsSold: 482,
      activeEvents: 3,
      conversionRate: 12.5
    });
  }, []);

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
              <h2 className="text-xl font-bold">Recent Sales</h2>
              <Link href="/organizer/sales" className="text-sm text-indigo-400 flex items-center gap-1 hover:underline">
                View all <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-bold text-xs">JD</div>
                    <div>
                      <p className="text-sm font-semibold">John Doe</p>
                      <p className="text-xs text-muted">2 tickets • Tech Conference 2024</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">$198.00</p>
                    <p className="text-[10px] text-muted">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6">Top Events</h2>
            <div className="flex flex-col gap-6">
              {[
                { id: "cm32abc", name: "Summer Music Fest", sold: 245, revenue: 12250 },
                { id: "cm32def", name: "Tech Conference", sold: 182, revenue: 36400 },
                { id: "cm32ghi", name: "Art Workshop", sold: 55, revenue: 2750 },
              ].map((event, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm font-semibold mb-2 items-center">
                    <span>{event.name}</span>
                    <div className="flex items-center gap-3">
                      <span>{formatCurrency(event.revenue)}</span>
                      <Link href={`/organizer/events/${event.id}/edit`} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded">Edit</Link>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(event.sold / 300) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-muted mt-1">{event.sold} tickets sold</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
