"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  { name: "Sarah K.", role: "Concert lover", avatar: "SK", quote: "Bought tickets in under 2 minutes. The QR code worked perfectly at the gate. Best ticketing app I've used.", rating: 5 },
  { name: "Marcus T.", role: "Event Organizer", avatar: "MT", quote: "Our sales doubled after switching to EventHub Pro. The organizer dashboard is incredibly powerful.", rating: 5 },
  { name: "Priya N.", role: "Sports fan", avatar: "PN", quote: "The seat selection was so intuitive. Got perfect seats for the game and the transfer feature saved my friend!", rating: 5 },
  { name: "James O.", role: "Festival goer", avatar: "JO", quote: "Love that I can add tickets to my Apple Wallet. No more screenshot hunting at the entrance.", rating: 5 },
  { name: "Amina B.", role: "Theatre enthusiast", avatar: "AB", quote: "Refund process was seamless when my show got cancelled. Money back in 24 hours. Incredible service.", rating: 5 },
  { name: "David L.", role: "Comedy club regular", avatar: "DL", quote: "The promo codes and group booking features saved us a ton. Highly recommend for group outings.", rating: 5 },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="container">
        <div className="text-center mb-14">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-sm font-semibold gradient-text uppercase tracking-widest mb-3">What People Say</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontFamily: "var(--font-display)" }}>Loved by Millions</motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card p-6 flex flex-col gap-4">
              <div className="flex gap-0.5">
                {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid var(--bg-border)" }}>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{t.avatar}</div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
