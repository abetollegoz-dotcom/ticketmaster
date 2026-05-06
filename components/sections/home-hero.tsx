"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Search, ArrowRight, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1600&q=80",
];

const QUICK_CATS = ["Concerts", "Sports", "Comedy", "Theatre", "Festivals", "Food & Drink"];

export function HomeHero() {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = ["concerts", "sports", "comedy", "theatre", "festivals", "venues"];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
          style={{ 
            backgroundImage: `url(${HERO_IMAGES[bgIndex]})`,
            filter: "brightness(0.6)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080812]/80 via-[#080812]/40 to-[#080812]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080812]/60 to-transparent" />
      </div>

      {/* Animated orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-30 animate-pulse-glow"
        style={{ background: "radial-gradient(circle, #6366f1, transparent)", filter: "blur(60px)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full opacity-20 animate-float"
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
            className="mb-6 text-white text-5xl md:text-7xl font-bold"
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
            className="text-lg md:text-xl mb-10 max-w-xl"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            Discover and book tickets to concerts, sports, theatre, festivals and
            thousands of live events. Secure QR tickets delivered instantly.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="max-w-2xl"
          >
            <form onSubmit={handleSearch} className="relative mb-6">
              <div 
                className={`flex gap-0 glass-dark rounded-2xl p-2 border transition-all duration-300 shadow-2xl ${
                  isFocused ? "border-indigo-500 ring-4 ring-indigo-500/20" : "border-white/10"
                }`}
              >
                <div className="flex items-center gap-4 flex-1 px-4">
                  <Search className={`w-6 h-6 flex-shrink-0 transition-colors ${isFocused ? "text-indigo-400" : "text-white/40"}`} />
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={query}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-white text-lg placeholder:text-transparent py-2.5"
                    />
                    {!query && (
                      <motion.div 
                        key={placeholderIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute inset-0 flex items-center pointer-events-none text-lg text-white/40"
                      >
                        Search for <span className="text-white/60 ml-1.5">{placeholders[placeholderIndex]}...</span>
                      </motion.div>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="btn-primary rounded-xl px-8 py-3.5 text-base font-bold whitespace-nowrap shadow-lg shadow-indigo-500/20"
                >
                  Find Events
                </motion.button>
              </div>
            </form>

            {/* Quick cat pills */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40 mr-1">Popular:</span>
              {QUICK_CATS.map((cat) => (
                <motion.div key={cat} whileHover={{ y: -2, scale: 1.05 }}>
                  <Link
                    href={`/events?category=${cat.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`}
                    className="text-xs px-4 py-2 rounded-full glass border border-white/10 hover:border-indigo-500/40 hover:text-indigo-400 transition-all font-medium"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {cat}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-5 mt-12"
          >
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/events" className="btn-primary py-4 px-10 text-lg font-bold">
                Explore All Events <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
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
