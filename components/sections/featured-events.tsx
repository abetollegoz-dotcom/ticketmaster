"use client";

import { motion } from "framer-motion";
import { EventCardComponent } from "@/components/cards/event-card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { EventCard } from "@/types";

export function FeaturedEvents({ events }: { events: EventCard[] }) {
  if (!events.length) return null;

  const [main, ...rest] = events;

  return (
    <section className="py-20">
      <div className="container">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold mb-2 gradient-text uppercase tracking-widest"
            >
              Handpicked for you
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontFamily: "var(--font-display)" }}
            >
              Featured Events
            </motion.h2>
          </div>
          <Link
            href="/events?featured=true"
            className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-indigo-400 transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            See all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main featured */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <EventCardComponent event={main} variant="featured" priority />
          </motion.div>

          {/* Side cards */}
          <div className="flex flex-col gap-4">
            {rest.slice(0, 3).map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <EventCardComponent event={event} variant="compact" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
