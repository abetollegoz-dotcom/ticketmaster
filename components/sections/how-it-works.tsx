"use client";
import { motion } from "framer-motion";
import { Search, CreditCard, QrCode, PartyPopper } from "lucide-react";

const STEPS = [
  { icon: Search, title: "Find Your Event", desc: "Search thousands of events by city, category, artist, or date. Filter by price and availability.", color: "from-indigo-500 to-violet-600" },
  { icon: CreditCard, title: "Buy Securely", desc: "Check out with Stripe, PayPal, Apple Pay or Google Pay. 100% secure & encrypted.", color: "from-violet-500 to-pink-500" },
  { icon: QrCode, title: "Get Digital Ticket", desc: "Receive your QR-coded ticket instantly by email. Add to Apple or Google Wallet.", color: "from-pink-500 to-rose-500" },
  { icon: PartyPopper, title: "Enjoy the Event", desc: "Show your QR code at the door and walk right in. No printing needed.", color: "from-amber-500 to-orange-500" },
];

export function HowItWorks() {
  return (
    <section className="py-24" style={{ background: "var(--bg-surface)" }}>
      <div className="container">
        <div className="text-center mb-14">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-sm font-semibold gradient-text uppercase tracking-widest mb-3">Simple Process</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ fontFamily: "var(--font-display)" }}>How It Works</motion.h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* connector line */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px" style={{ background: "linear-gradient(to right, transparent, var(--bg-border), transparent)" }} />
          {STEPS.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center gap-4">
              <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-9 h-9 text-white" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--bg-elevated)", border: "2px solid var(--bg-border)" }}>{i + 1}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-display)" }} className="text-lg font-700">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
