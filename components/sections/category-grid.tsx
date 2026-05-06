"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Music, Dumbbell, Laugh, Drama, Sunset, Utensils, Cpu, Palette, ArrowRight } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  music: <Music className="w-7 h-7" />,
  sports: <Dumbbell className="w-7 h-7" />,
  comedy: <Laugh className="w-7 h-7" />,
  theatre: <Drama className="w-7 h-7" />,
  festivals: <Sunset className="w-7 h-7" />,
  food: <Utensils className="w-7 h-7" />,
  tech: <Cpu className="w-7 h-7" />,
  arts: <Palette className="w-7 h-7" />,
};

const GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-emerald-500 to-teal-500",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-violet-500",
  "from-yellow-500 to-amber-400",
];

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const displayCats = categories.slice(0, 8);

  return (
    <section className="py-20" style={{ background: "var(--bg-surface)" }}>
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-sm font-semibold mb-2 gradient-text uppercase tracking-widest"
            >
              Explore
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontFamily: "var(--font-display)" }}
            >
              Browse by Category
            </motion.h2>
          </div>
          <Link href="/categories" className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-indigo-400 transition-colors" style={{ color: "var(--text-secondary)" }}>
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {displayCats.map((cat, i) => {
            const gradient = GRADIENTS[i % GRADIENTS.length];
            const icon = ICON_MAP[cat.slug] ?? ICON_MAP["arts"];

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/events?category=${cat.slug}`}>
                  <div className="group flex flex-col items-center gap-3 p-5 rounded-2xl card hover:scale-105 transition-all duration-300 cursor-pointer text-center">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                    >
                      {icon}
                    </div>
                    <span className="text-sm font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                      {cat.name}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
