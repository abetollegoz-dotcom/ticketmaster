"use client";

import { motion } from "framer-motion";
import { formatNumber } from "@/lib/utils";
import { Ticket, Users, MapPin, TrendingUp } from "lucide-react";

interface StatsBarProps {
  stats: {
    events: number;
    tickets: number;
    users: number;
    venues: number;
  };
}

const STAT_ITEMS = [
  { icon: Ticket, label: "Live Events", key: "events" as const, suffix: "+" },
  { icon: Users, label: "Happy Customers", key: "users" as const, suffix: "+" },
  { icon: MapPin, label: "Venues Worldwide", key: "venues" as const, suffix: "+" },
  { icon: TrendingUp, label: "Tickets Sold", key: "tickets" as const, suffix: "+" },
];

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <section className="py-6 relative" style={{ borderTop: "1px solid var(--bg-border)", borderBottom: "1px solid var(--bg-border)", background: "var(--bg-surface)" }}>
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STAT_ITEMS.map(({ icon: Icon, label, key, suffix }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(99,102,241,0.15)" }}>
                <Icon className="w-5 h-5" style={{ color: "var(--brand-400)" }} />
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-display)" }} className="text-xl font-bold gradient-text">
                  {formatNumber(stats[key] || 0)}{suffix}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
