"use client";
import Link from "next/link";
import { CheckCircle, Ticket, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store";
import { useEffect } from "react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const isPending = searchParams.get("pending") === "true";
  const orderId = searchParams.get("orderId");
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear cart on successful landing here if it wasn't cleared yet
    if (!isPending) {
      clearCart();
    }
  }, [isPending, clearCart]);

  return (
    <div className="container py-24 flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12 }}
        className={`w-24 h-24 ${isPending ? 'bg-amber-500/10' : 'bg-emerald-500/10'} rounded-full flex items-center justify-center mb-8`}
      >
        <CheckCircle className={`w-12 h-12 ${isPending ? 'text-amber-400' : 'text-emerald-400'}`} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-4"
      >
        {isPending ? "Order Placed!" : "Payment Successful!"}
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-secondary text-lg mb-12 max-w-md"
      >
        {isPending 
          ? `Your order ${orderId ? `#${orderId}` : ''} is pending manual approval. Once the organizer confirms your payment, your QR code tickets will appear in your dashboard.` 
          : "Your tickets are confirmed and have been sent to your email. You can also find them in your dashboard."}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
      >
        <Link href="/dashboard/tickets" className="btn-primary flex-1 py-4 gap-2">
          <Ticket className="w-5 h-5" /> View Tickets
        </Link>
        <Link href="/events" className="btn-ghost flex-1 py-4 gap-2">
          Explore More <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-sm font-semibold">Add to Calendar</p>
          <p className="text-xs text-muted">Don't miss the start time!</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-sm font-semibold">Verified Tickets</p>
          <p className="text-xs text-muted">Guaranteed entry to the event</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-sm font-semibold">Support 24/7</p>
          <p className="text-xs text-muted">We're here to help anytime</p>
        </div>
      </motion.div>
    </div>
  );
}
