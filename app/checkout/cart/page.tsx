"use client";
import { useCartStore } from "@/store";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getSummary } = useCartStore();
  const summary = getSummary();

  if (items.length === 0) {
    return (
      <div className="container py-24 text-center">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-secondary mb-8">Looks like you haven't added any tickets yet.</p>
        <Link href="/events" className="btn-primary py-3 px-8">Browse Events</Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map((item) => (
            <motion.div key={item.ticketTypeId} layout className="card p-4 flex gap-4">
              <div className="flex-1">
                <h3 className="font-bold">{item.eventTitle}</h3>
                <p className="text-sm text-secondary">{item.ticketTypeName}</p>
                <p className="text-xs text-muted mt-1">{item.eventDate}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border rounded-lg p-1" style={{ borderColor: "var(--bg-border)" }}>
                  <button onClick={() => updateQuantity(item.ticketTypeId, item.quantity - 1)} className="p-1 hover:bg-white/5 rounded">-</button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.ticketTypeId, item.quantity + 1)} className="p-1 hover:bg-white/5 rounded">+</button>
                </div>
                <p className="font-bold w-20 text-right">{formatCurrency(item.unitPrice * item.quantity)}</p>
                <button onClick={() => removeItem(item.ticketTypeId)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="card p-6 h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-6">Order Summary</h2>
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Subtotal</span>
              <span>{formatCurrency(summary.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Service Fee</span>
              <span>{formatCurrency(summary.serviceFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary">Tax</span>
              <span>{formatCurrency(summary.taxAmount)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="gradient-text">{formatCurrency(summary.total)}</span>
            </div>
          </div>
          <Link href="/checkout/payment" className="btn-primary w-full py-3.5 gap-2">
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-center mt-4 text-muted">Secure checkout powered by Stripe</p>
        </div>
      </div>
    </div>
  );
}
