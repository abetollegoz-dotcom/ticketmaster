"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, CreditCard, Clock, CheckCircle, XCircle, ChevronRight, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/toaster";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${status}&q=${search}`);
      const json = await res.json();
      setOrders(json.data?.orders || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this order and issue tickets?")) return;
    
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "CONFIRMED",
          paymentStatus: "COMPLETED",
          manualPaymentNote: "Manually approved via WhatsApp workflow."
        })
      });
      
      if (!res.ok) throw new Error("Failed to approve order");
      
      toast.success("Order Approved!", "Tickets have been issued and sent to the client.");
      fetchOrders();
    } catch (err: any) {
      toast.error("Approval failed", err.message);
    }
  };

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Manual Payment Queue</h1>
          <p className="text-secondary text-sm">Review bank transfers, M-Pesa, and alternative payment confirmations.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search by order number or customer..." 
            className="input pl-10 w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchOrders()}
          />
        </div>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
          {["PENDING", "CONFIRMED", "CANCELLED"].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${status === s ? "bg-indigo-500 text-white shadow-lg" : "text-muted hover:text-white"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-white/2 text-muted uppercase text-[10px] font-bold tracking-wider border-b border-white/5">
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
               <tr><td colSpan={5} className="p-12 text-center text-muted">Loading queue...</td></tr>
            ) : orders.length === 0 ? (
               <tr><td colSpan={5} className="p-12 text-center text-muted">No orders in this queue.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-mono text-indigo-400 text-xs font-bold">{order.orderNumber}</p>
                    <p className="text-[10px] text-muted">{order.items[0]?.event?.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold">{order.user.name}</p>
                    <p className="text-[10px] text-muted">{order.user.email}</p>
                  </td>
                  <td className="px-6 py-4 font-bold">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.payment?.status || "PENDING"} />
                      {order.payment?.isManualPayment && (
                        <span className="p-1 bg-amber-500/10 text-amber-500 rounded" title="Manual Payment">
                          <CreditCard className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {order.status === "PENDING" && (
                        <button 
                          onClick={() => handleApprove(order.id)}
                          className="btn bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 p-2 text-xs flex items-center gap-1 border border-emerald-500/20"
                        >
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                      )}
                      <Link href={`/admin/orders/${order.id}`} className="btn-ghost p-2 inline-flex items-center gap-2 text-xs">
                        Review <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
