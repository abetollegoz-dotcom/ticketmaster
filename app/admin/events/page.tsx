"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Filter, MoreVertical, Edit3, ShieldAlert, Globe, Star, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "@/components/ui/toaster";
import { formatDateShort } from "@/lib/utils";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/stats"); // Existing endpoint returns events
      const json = await res.json();
      setEvents(json.data?.pendingEvents || []); // Using pendingEvents as a base, usually we'd want all events
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load events");
      setLoading(false);
    }
  };

  const handleToggleSpecial = async (id: string, field: "isFeatured" | "isTrending", current: boolean) => {
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !current }),
      });
      if (!res.ok) throw new Error();
      setEvents(events.map(e => e.id === id ? { ...e, [field]: !current } : e));
      toast.success(`${field} updated`);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const filtered = events.filter(e => {
    const matchSearch = e.name?.toLowerCase().includes(search.toLowerCase()) || e.org?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "ALL" || e.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="container py-20 text-center">Loading management panel...</div>;

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Event Marketplace Control</h1>
          <p className="text-secondary text-sm">Global moderation and marketplace feature management.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search events or organizers..." 
            className="input pl-10 w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="input w-full md:w-48"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING_APPROVAL">Pending</option>
          <option value="PUBLISHED">Published</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="POSTPONED">Postponed</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-white/2 text-muted uppercase text-[10px] font-bold tracking-wider border-b border-white/5">
              <th className="px-6 py-4">Event & Organizer</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Featured</th>
              <th className="px-6 py-4">Trending</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((event, i) => (
              <motion.tr 
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="hover:bg-white/2 transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="font-semibold">{event.name}</p>
                  <p className="text-[10px] text-muted uppercase tracking-tighter">{event.org}</p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={event.status} />
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleToggleSpecial(event.id, "isFeatured", event.isFeatured)}
                    className={`p-1.5 rounded-lg transition-colors ${event.isFeatured ? "text-amber-400 bg-amber-400/10" : "text-muted bg-white/5 hover:bg-white/10"}`}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleToggleSpecial(event.id, "isTrending", event.isTrending)}
                    className={`p-1.5 rounded-lg transition-colors ${event.isTrending ? "text-indigo-400 bg-indigo-400/10" : "text-muted bg-white/5 hover:bg-white/10"}`}
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/events/${event.id}/edit`} className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg">
                      <Edit3 className="w-4 h-4" />
                    </Link>
                    <button className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg">
                      <ShieldAlert className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted">No events found.</div>
        )}
      </div>
    </div>
  );
}
