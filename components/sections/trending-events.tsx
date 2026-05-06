"use client";

import { motion } from "framer-motion";
import { EventCardComponent } from "@/components/cards/event-card";
import { ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { EventCard } from "@/types";

export function TrendingEvents({ events }: { events: EventCard[] }) {
  if (!events.length) return null;
  return (
    <section className="py-20">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <p className="text-sm font-semibold text-amber-400 uppercase tracking-widest">Hot right now</p>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontFamily: "var(--font-display)" }}>Trending Events</motion.h2>
          </div>
          <Link href="/events?sort=trending" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-indigo-400 transition-colors" style={{ color: "var(--text-secondary)" }}>
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event, i) => (
            <motion.div key={event.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <EventCardComponent event={event} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
