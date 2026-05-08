"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, TrendingUp, Heart } from "lucide-react";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import type { EventCard } from "@/types";

interface EventCardProps {
  event: EventCard;
  variant?: "default" | "featured" | "compact";
  priority?: boolean;
}

export function EventCardComponent({ event, variant = "default", priority = false }: EventCardProps) {
  const minPrice = event.ticketTypes.length
    ? Math.min(...event.ticketTypes.map((t) => Number(t.price)))
    : 0;
  const startDate = event.dates[0]?.startDate;
  
  // Handle images as array or single string (for SQLite compatibility)
  const image = Array.isArray(event.images) 
    ? (event.images[0] || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80`)
    : (event.images || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80`);

  if (variant === "compact") {
    return (
      <Link href={`/events/${event.slug}`} className="flex gap-3 group">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
          <Image src={image} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold line-clamp-1 group-hover:text-indigo-400 transition-colors">{event.title}</p>
          {startDate && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {formatDateShort(startDate)}
            </p>
          )}
          <p className="text-sm font-bold mt-1 gradient-text">
            {minPrice === 0 ? "Free" : `From ${formatCurrency(minPrice)}`}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/events/${event.slug}`}>
        <motion.article
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-2xl group cursor-pointer"
          style={{ minHeight: 480 }}
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={image}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority={priority}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {event.isFeatured && (
              <span className="badge badge-brand">⭐ Featured</span>
            )}
            {event.isTrending && (
              <span className="badge badge-warning">🔥 Trending</span>
            )}
            {event.category && (
              <span className="badge" style={{ background: "rgba(0,0,0,0.5)", color: "white" }}>
                {event.category.name}
              </span>
            )}
          </div>

          {/* Favorite */}
          <button className="absolute top-4 right-4 w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-red-500/20 transition-colors" onClick={(e) => e.preventDefault()}>
            <Heart className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-bold text-white mb-2 line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-white/70 mb-4">
              {startDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDateShort(startDate)}
                </span>
              )}
              {event.venue && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.venue.city}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {event.totalSales} sold
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-white">
                {minPrice === 0 ? "Free" : `From ${formatCurrency(minPrice)}`}
              </p>
              <span className="btn-primary text-sm py-2 px-5">Get Tickets →</span>
            </div>
          </div>
        </motion.article>
      </Link>
    );
  }

  return (
    <Link href={`/events/${event.slug}`}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="card overflow-hidden group cursor-pointer h-full"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={image}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            {event.isTrending && (
              <span className="badge badge-warning">
                <TrendingUp className="w-3 h-3 mr-0.5" /> Trending
              </span>
            )}
            {event.category && (
              <span className="badge badge-brand">{event.category.name}</span>
            )}
          </div>

          <button
            className="absolute top-3 right-3 w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-red-500/20 transition-colors"
            onClick={(e) => e.preventDefault()}
            aria-label="Add to favorites"
          >
            <Heart className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-2">
          <h3
            style={{ fontFamily: "var(--font-display)" }}
            className="font-700 text-base leading-tight line-clamp-2 group-hover:text-indigo-400 transition-colors"
          >
            {event.title}
          </h3>

          <div className="flex flex-col gap-1.5">
            {startDate && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDateShort(startDate)}</span>
              </div>
            )}
            {event.venue && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <MapPin className="w-3.5 h-3.5" />
                <span className="line-clamp-1">{event.venue.name}, {event.venue.city}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: "1px solid var(--bg-border)" }}>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>From</p>
              <p className="text-base font-bold gradient-text">
                {minPrice === 0 ? "Free" : formatCurrency(minPrice)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
              <Users className="w-3.5 h-3.5" />
              {event.totalSales}
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
