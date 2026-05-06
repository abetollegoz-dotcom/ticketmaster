"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Search, ArrowRight, Star } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1600&q=80",
];

const QUICK_CATS = ["Concerts", "Sports", "Comedy", "Theatre", "Festivals", "Food & Drink"];

export function HomeHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [bgIndex] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${HERO_IMAGES[bgIndex]})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080812]/80 via-[#080812]/60 to-[#080812]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080812]/60 to-transparent" />
      </div>

      {/* Animated orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 animate-pulse-glow"
        style={{ background: "radial-gradient(circle, #6366f1, transparent)", filter: "blur(60px)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full opacity-15 animate-float"
        style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", filter: "blur(80px)", animationDelay: "1s" }}
      />

      <div className="container relative z-10">
        <div className="max-w-3xl">
          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Trusted by <strong className="text-white">2M+</strong> event-goers worldwide
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ fontFamily: "var(--font-display)", lineHeight: 1.1 }}
            className="mb-6 text-white"
          >
            Your Next{" "}
            <span className="gradient-text">Unforgettable</span>
            <br />
            Experience Awaits
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg mb-8 max-w-xl"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Discover and book tickets to concerts, sports, theatre, festivals and
            thousands of live events. Secure QR tickets delivered instantly.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <form onSubmit={handleSearch} className="relative mb-4">
              <div className="flex gap-0 glass-dark rounded-2xl p-2 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 flex-1 px-3">
                  <Search className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search events, artists, venues, cities..."
                    className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder:text-white/40 py-2"
                    style={{ boxShadow: "none" }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary rounded-xl px-6 py-3 text-base whitespace-nowrap"
                >
                  Search Events
                </button>
              </div>
            </form>

            {/* Quick cat pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Popular:</span>
              {QUICK_CATS.map((cat) => (
                <Link
                  key={cat}
                  href={`/events?category=${cat.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                  className="text-xs px-3 py-1.5 rounded-full glass border border-white/10 hover:border-indigo-500/40 hover:text-indigo-400 transition-all"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {cat}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4 mt-10"
          >
            <Link href="/events" className="btn-primary py-3.5 px-7 text-base">
              Browse All Events <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "var(--text-muted)" }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-current" />
        </div>
      </motion.div>
    </section>
  );
}
