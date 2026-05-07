"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit3, Calendar, Ticket, TrendingUp, Search, ChevronRight, Filter } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDateShort } from "@/lib/utils";

const TABS = [
  { key: "ALL", label: "All" },
  { key: "PUBLISHED", label: "Published" },
  { key: "DRAFT", label: "Drafts" },
  { key: "POSTPONED", label: "Postponed" },
  { key: "CANCELLED", label: "Cancelled" },
];

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/organizer/stats")
      .then(r => r.json())
      .then(json => {
        setEvents(json.data?.events || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = events.filter(e => {
    const matchTab = tab === "ALL" || e.status === tab;
    const matchSearch = !search || e.name?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted text-sm">Loading events…</p>
      </div>
    );
  }

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Events</h1>
          <p className="text-secondary text-sm">{events.length} event{events.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link href="/organizer/events/new" className="btn-primary py-3 px-6 gap-2">
          <Plus className="w-5 h-5" /> Create Event
        </Link>
      </div>

      {/* Search + Filter tabs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search events…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.key
                  ? "bg-indigo-500 text-white"
                  : "bg-white/5 text-secondary hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events grid */}
      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted opacity-40" />
          <p className="text-muted mb-6">No events match your filter.</p>
          <Link href="/organizer/events/new" className="btn-primary py-2.5 px-6 inline-flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Create your first event
          </Link>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.04 }}
                className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-indigo-500/30 transition-colors group"
              >
                {/* Status dot */}
                <div className="shrink-0">
                  <StatusBadge status={event.status} />
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate group-hover:text-indigo-400 transition-colors">{event.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted">
                    {event.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {event.date}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3 h-3" /> {event.sold ?? 0} sold
                    </span>
                    {event.revenue !== undefined && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <TrendingUp className="w-3 h-3" /> {formatCurrency(event.revenue)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ticket progress */}
                {event.capacity > 0 && (
                  <div className="hidden md:block w-32 shrink-0">
                    <div className="flex justify-between text-[10px] text-muted mb-1.5">
                      <span>{event.sold ?? 0}</span>
                      <span>{event.capacity}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${Math.min(100, ((event.sold ?? 0) / event.capacity) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/organizer/events/${event.id}/edit`}
                    className="btn-ghost py-2 px-4 text-sm gap-1.5 inline-flex items-center"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <ChevronRight className="w-5 h-5 text-muted self-center hidden sm:block" />
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
