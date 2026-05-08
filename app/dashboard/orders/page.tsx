"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag, Calendar, Download, ChevronDown, ChevronUp,
  CheckCircle, Clock, XCircle, RefreshCcw, Loader2, CreditCard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import Image from "next/image";
import { toast } from "@/components/ui/toaster";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
  event: { title: string; slug: string; images: string[] };
  eventDate: { startDate: string } | null;
  ticketType: { name: string; category: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string | number;
  serviceFee: string | number;
  taxAmount: string | number;
  discount: string | number;
  total: string | number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
  payment: { status: string; provider: string } | null;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  CONFIRMED:          { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle,  label: "Confirmed" },
  PENDING:            { color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",     icon: Clock,        label: "Pending" },
  CANCELLED:          { color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-500/20",       icon: XCircle,      label: "Cancelled" },
  REFUNDED:           { color: "text-indigo-400",  bg: "bg-indigo-500/10 border-indigo-500/20",   icon: RefreshCcw,   label: "Refunded" },
  PARTIALLY_REFUNDED: { color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20",   icon: RefreshCcw,   label: "Partial Refund" },
};

async function downloadStatement(orderId: string, orderNumber: string) {
  const res = await fetch(`/api/orders/${orderId}/statement`);
  if (!res.ok) throw new Error("Failed to generate statement");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `statement-${orderNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;
  const firstItem = order.items[0];

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      await downloadStatement(order.id, order.orderNumber);
      toast.success("Statement downloaded!");
    } catch {
      toast.error("Failed to download statement.");
    } finally {
      setDownloading(false);
    }
  }, [order.id, order.orderNumber]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      {/* Card header */}
      <div
        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-white/2 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Event image thumbnail */}
        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative bg-white/5">
          {firstItem?.event?.images?.[0] ? (
            <Image
              src={firstItem.event.images[0]}
              alt={firstItem.event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-slate-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{firstItem?.event?.title ?? "Order"}</p>
          {order.items.length > 1 && (
            <p className="text-xs text-muted">+{order.items.length - 1} more event{order.items.length > 2 ? "s" : ""}</p>
          )}
          <p className="text-xs text-muted mt-0.5 font-mono">#{order.orderNumber}</p>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          <span className="font-bold text-indigo-400">{formatCurrency(order.total, order.currency)}</span>
          <span className="text-xs text-muted">{formatDateShort(order.createdAt)}</span>
        </div>

        <div className="ml-2 text-secondary">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/6"
          >
            <div className="p-5 space-y-4">
              {/* Line items */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="w-10 h-10 rounded-lg overflow-hidden relative flex-shrink-0 bg-white/5">
                      {item.event.images?.[0] && (
                        <Image src={item.event.images[0]} alt={item.event.title} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{item.event.title}</p>
                      <p className="text-xs text-muted">{item.ticketType.name} · x{item.quantity}</p>
                      {item.eventDate && (
                        <p className="text-xs text-indigo-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDateShort(item.eventDate.startDate)}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm">{formatCurrency(item.totalPrice)}</p>
                      <p className="text-xs text-muted">{formatCurrency(item.unitPrice)} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="rounded-xl bg-white/3 border border-white/5 overflow-hidden">
                {[
                  { label: "Subtotal",    value: formatCurrency(order.subtotal) },
                  { label: "Service Fee", value: formatCurrency(order.serviceFee) },
                  { label: "Tax",         value: formatCurrency(order.taxAmount) },
                  ...(Number(order.discount) > 0 ? [{ label: "Discount", value: `-${formatCurrency(order.discount)}` }] : []),
                ].map((row) => (
                  <div key={row.label} className="flex justify-between px-4 py-2 text-sm border-b border-white/5">
                    <span className="text-muted">{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between px-4 py-3 font-bold bg-indigo-600/10">
                  <span className="text-indigo-300">Total</span>
                  <span className="text-indigo-400">{formatCurrency(order.total, order.currency)}</span>
                </div>
              </div>

              {/* Payment info */}
              {order.payment && (
                <div className="flex items-center gap-2 text-xs text-muted bg-white/3 rounded-xl px-4 py-3 border border-white/5">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  <span>Paid via <strong className="text-secondary">{order.payment.provider}</strong></span>
                  <span className="mx-1">·</span>
                  <span className={order.payment.status === "COMPLETED" ? "text-emerald-400" : "text-amber-400"}>
                    {order.payment.status}
                  </span>
                </div>
              )}

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-primary w-full py-3 gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating Statement…</>
                ) : (
                  <><Download className="w-4 h-4" /> Download Statement PDF</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="container py-12">
        <div className="h-10 w-48 bg-white/5 rounded-xl mb-8 animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl bg-white/5 h-24 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-24 text-center">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4">No orders yet</h1>
        <p className="text-secondary mb-8">Your order history will appear here after your first purchase.</p>
        <a href="/events" className="btn-primary py-3 px-8 inline-block">Browse Events</a>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <span className="badge badge-brand">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-4 max-w-3xl">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
