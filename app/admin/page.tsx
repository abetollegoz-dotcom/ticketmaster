"use client";
import { useState, useEffect } from "react";
import { 
  ShieldCheck, AlertOctagon, Globe, BarChart3, 
  Users, Ticket, DollarSign, ArrowUpRight, 
  Search, Filter, MoreVertical, Ban, CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, formatNumber } from "@/lib/utils";
import Link from "next/link";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(res => res.json())
      .then(json => {
        setData(json.data);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/events/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update");

      // Update local state
      setData({
        ...data,
        pendingEvents: data.pendingEvents.filter((e: any) => e.id !== id),
      });
      alert(`Event ${newStatus.toLowerCase()}!`);
    } catch (err) {
      alert("Error updating status");
    }
  };

  if (loading) return <div className="container py-20 text-center">Loading dashboard...</div>;

  const stats = data.stats;
  const mainStats = [
    { label: "GMV", value: formatCurrency(stats.gmv), icon: Globe, color: "text-blue-400" },
    { label: "Platform Revenue", value: formatCurrency(stats.platformRevenue), icon: DollarSign, color: "text-emerald-400" },
    { label: "Total Users", value: formatNumber(stats.totalUsers), icon: Users, color: "text-indigo-400" },
    { label: "Fraud Alerts", value: stats.fraudAlerts, icon: AlertOctagon, color: "text-red-400" },
  ];

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Global Admin Center</h1>
          <p className="text-secondary">Platform-wide overview and marketplace control.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost py-2.5 px-5 text-sm gap-2">
            <BarChart3 className="w-4 h-4" /> Reports
          </button>
          <button className="btn-primary py-2.5 px-5 text-sm gap-2 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-4 h-4" /> Security Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {mainStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="card p-6 border-l-4 border-l-indigo-500"
            style={{ borderLeftColor: i === 3 ? "var(--accent-pink)" : undefined }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/5 rounded-lg">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-xl font-bold">Event Moderation Queue</h2>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input type="text" placeholder="Search events..." className="pl-9 py-2 text-sm" />
              </div>
            </div>
            <div className="overflow-x-auto">
              {data.pendingEvents.length === 0 ? (
                <div className="p-12 text-center text-muted">No pending events to moderate.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-white/2 text-muted uppercase text-[10px] font-bold tracking-wider">
                      <th className="px-6 py-4">Event Details</th>
                      <th className="px-6 py-4">Organizer</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.pendingEvents.map((event: any, i: number) => (
                      <tr key={i} className="hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold">{event.name}</p>
                          <p className="text-[10px] text-muted">Submitted {event.date}</p>
                        </td>
                        <td className="px-6 py-4 text-secondary">{event.org}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400">
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleStatusChange(event.id, "PUBLISHED")}
                              className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg" title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(event.id, "CANCELLED")}
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg" title="Reject"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                            <Link href={`/admin/events/${event.id}/edit`} className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg" title="Edit">
                              <MoreVertical className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t border-white/5 text-center">
              <button className="text-xs text-indigo-400 font-semibold hover:underline">View all moderation tasks</button>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6">Fraud Alerts</h2>
            <div className="flex flex-col gap-4">
              {[
                { type: "Velocity Check", detail: "5 failed attempts from IP 192.168.1.1", time: "10m ago" },
                { type: "Duplicate QR", detail: "Scanned twice in 5 seconds (Ticket #EH-82A1)", time: "1h ago" },
                { type: "VPN Detected", detail: "Purchase from high-risk country via VPN", time: "3h ago" },
              ].map((alert, i) => (
                <div key={i} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider">{alert.type}</p>
                    <span className="text-[10px] text-muted">{alert.time}</span>
                  </div>
                  <p className="text-sm text-secondary mb-3">{alert.detail}</p>
                  <div className="flex gap-2">
                    <button className="text-[10px] font-bold bg-white/5 hover:bg-white/10 px-3 py-1 rounded-md transition-colors uppercase">Investigate</button>
                    <button className="text-[10px] font-bold bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-md transition-colors uppercase">Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
