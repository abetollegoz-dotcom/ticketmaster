"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Share2, Heart, Clock, ChevronDown, ChevronUp, Star, Minus, Plus, ShoppingCart } from "lucide-react";
import { formatCurrency, formatDate, getCountdownParts } from "@/lib/utils";
import { useCartStore } from "@/store";
import { toast } from "@/components/ui/toaster";
import { EventCardComponent } from "@/components/cards/event-card";
import type { EventCard } from "@/types";

interface TicketType { id: string; name: string; description?: string | null; category: string; price: string | number; quantity: number; quantitySold: number; quantityReserved: number; minPerOrder: number; maxPerOrder: number; isVisible: boolean; }
interface EventDetailClientProps {
  event: {
    id: string; title: string; slug: string; description: string; images: string[];
    dates: { id: string; startDate: Date; endDate: Date; doorsOpen?: Date | null }[];
    venue?: { name: string; address: string; city: string; country: string; latitude?: number | null; longitude?: number | null } | null;
    category?: { name: string; slug: string } | null;
    organizer: { organizationName: string; slug: string; logo?: string | null; isVerified: boolean; description?: string | null };
    ticketTypes: TicketType[];
    reviews: { id: string; rating: number; comment?: string | null; createdAt: Date; user: { name?: string | null; image?: string | null } }[];
    _count: { favorites: number; reviews: number };
    tags: string[];
    refundPolicy?: string | null;
  };
  related: EventCard[];
}

export function EventDetailClient({ event, related }: EventDetailClientProps) {
  const { addItem } = useCartStore();
  const [selImage, setSelImage] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [descExpanded, setDescExpanded] = useState(false);

  const mainDate = event.dates[0];

  useEffect(() => {
    if (!mainDate) return;
    const update = () => setCountdown(getCountdownParts(new Date(mainDate.startDate)));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [mainDate]);

  const setQty = (id: string, delta: number, tt: TicketType) => {
    const available = tt.quantity - tt.quantitySold - tt.quantityReserved;
    setQuantities(q => {
      const cur = q[id] || 0;
      const next = Math.max(0, Math.min(available, tt.maxPerOrder, cur + delta));
      return { ...q, [id]: next };
    });
  };

  const handleAddToCart = () => {
    let added = 0;
    for (const tt of event.ticketTypes) {
      const qty = quantities[tt.id] || 0;
      if (qty < 1) continue;
      addItem({
        ticketTypeId: tt.id, eventId: event.id,
        eventDateId: mainDate?.id,
        quantity: qty, unitPrice: Number(tt.price),
        ticketTypeName: tt.name, eventTitle: event.title,
        eventDate: mainDate ? formatDate(mainDate.startDate) : undefined,
      });
      added += qty;
    }
    if (added === 0) { toast.error("Select tickets", "Please select at least 1 ticket"); return; }
    toast.success(`${added} ticket${added > 1 ? "s" : ""} added to cart!`);
  };

  const images = event.images.length ? event.images : ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80"];
  const avgRating = event.reviews.length ? event.reviews.reduce((s, r) => s + r.rating, 0) / event.reviews.length : 0;

  return (
    <div className="py-8">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black">
                <Image src={images[selImage]} alt={event.title} fill className="object-cover" priority />
                {event.category && (
                  <span className="absolute top-4 left-4 badge badge-brand">{event.category.name}</span>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-red-500/20 transition-colors" aria-label="Favorite">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigator.share?.({ title: event.title, url: window.location.href })} className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors" aria-label="Share">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelImage(i)} className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === selImage ? "border-indigo-500" : "border-transparent opacity-60 hover:opacity-100"}`}>
                      <Image src={img} alt="" width={80} height={64} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
              <h1 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-bold mb-4">{event.title}</h1>
              <div className="flex flex-wrap gap-4 mb-6">
                {mainDate && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    {formatDate(mainDate.startDate)}
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    {event.venue.name}, {event.venue.city}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{event._count.favorites} saved</span>
                </div>
              </div>
              <div>
                <div className={`text-sm leading-relaxed overflow-hidden transition-all ${descExpanded ? "" : "max-h-32"}`} style={{ color: "var(--text-secondary)" }}
                  dangerouslySetInnerHTML={{ __html: event.description.replace(/\n/g, "<br/>") }} />
                <button onClick={() => setDescExpanded(!descExpanded)} className="flex items-center gap-1 text-sm font-semibold text-indigo-400 mt-3 hover:text-indigo-300 transition-colors">
                  {descExpanded ? <><ChevronUp className="w-4 h-4" /> Show less</> : <><ChevronDown className="w-4 h-4" /> Read more</>}
                </button>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-5">
              <div className="card p-5">
                <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl font-bold mb-5">Select Tickets</h2>
                <div className="flex flex-col gap-4">
                  {event.ticketTypes.map(tt => {
                    const available = tt.quantity - tt.quantitySold - tt.quantityReserved;
                    const qty = quantities[tt.id] || 0;
                    return (
                      <div key={tt.id} className="rounded-xl p-4" style={{ background: "var(--bg-overlay)" }}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm">{tt.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{available} left</p>
                          </div>
                          <p className="text-base font-bold gradient-text">{formatCurrency(tt.price)}</p>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setQty(tt.id, -1, tt)} disabled={qty <= 0} className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all disabled:opacity-30" style={{ borderColor: "var(--bg-border)" }}><Minus className="w-3 h-3" /></button>
                          <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                          <button onClick={() => setQty(tt.id, 1, tt)} disabled={qty >= Math.min(available, tt.maxPerOrder)} className="w-7 h-7 rounded-lg flex items-center justify-center border transition-all disabled:opacity-30" style={{ borderColor: "var(--bg-border)" }}><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button onClick={handleAddToCart} className="btn-primary w-full py-3.5 mt-4 gap-2">
                  <ShoppingCart className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
