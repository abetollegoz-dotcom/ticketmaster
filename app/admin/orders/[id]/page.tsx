"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CreditCard, User, Calendar, Ticket, CheckCircle, 
  XCircle, Clock, AlertTriangle, MessageSquare, ArrowLeft 
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";
import Link from "next/link";

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState("");
  const [ref, setRef] = useState("");

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(res => res.json())
      .then(json => {
        setOrder(json.data);
        setNote(json.data.manualPaymentNote || "");
        setRef(json.data.payment?.manualPaymentRef || "");
        setLoading(false);
      });
  }, [id]);

  const handleUpdateStatus = async (oStatus: string, pStatus: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: oStatus,
          paymentStatus: pStatus,
          manualPaymentNote: note,
          manualPaymentRef: ref,
          isManualPayment: true
        }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setOrder(json.data);
      toast.success("Order status updated successfully");
    } catch (err) {
      toast.error("Failed to update order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTicketAction = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      
      // Update local state
      setOrder({
        ...order,
        tickets: order.tickets.map((t: any) => t.id === ticketId ? json.data : t)
      });
      toast.success(`Ticket ${status.toLowerCase()}`);
    } catch (err) {
      toast.error("Ticket update failed");
    }
  };

  if (loading) return <div className="container py-20 text-center">Loading order details...</div>;
  if (!order) return <div className="container py-20 text-center text-red-400">Order not found.</div>;

  return (
    <div className="container py-12 max-w-5xl">
      <Link href="/admin/orders" className="text-sm text-muted hover:text-white flex items-center gap-2 mb-8 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Queue
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {/* Order Info Card */}
          <div className="card p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] text-muted uppercase font-bold tracking-widest mb-1">Order Summary</p>
                <h1 className="text-2xl font-mono font-bold text-indigo-400">{order?.orderNumber}</h1>
              </div>
              <StatusBadge status={order?.status} className="px-4 py-1" />
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-xs text-muted mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Customer</p>
                <p className="font-semibold">{order?.user?.name}</p>
                <p className="text-xs text-secondary">{order?.user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Placed On</p>
                <p className="font-semibold">{order?.createdAt ? formatDate(order.createdAt) : "—"}</p>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6">
               <p className="text-xs text-muted mb-4 uppercase font-bold tracking-widest">Order Items</p>
               {order?.items?.map((item: any, i: number) => (
                 <div key={i} className="flex justify-between items-center mb-4 last:mb-0">
                    <div>
                      <p className="font-bold">{item.event?.title}</p>
                      <p className="text-xs text-secondary">{item.quantity}x {item.ticketType?.name} ({item.ticketType?.category})</p>
                    </div>
                    <p className="font-bold">{formatCurrency(item.totalPrice)}</p>
                 </div>
               ))}
               <div className="border-t border-white/5 mt-6 pt-4 flex justify-between items-center">
                  <p className="text-lg font-bold">Total Amount</p>
                  <p className="text-2xl font-black text-indigo-400">{order?.total ? formatCurrency(order.total) : "—"}</p>
               </div>
            </div>
          </div>

          {/* Tickets Approval Section */}
          <div className="card p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-400" /> Ticket Management
            </h2>
            <div className="space-y-4">
              {order?.tickets?.map((ticket: any) => (
                <div key={ticket.id} className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono text-xs font-bold">{ticket.ticketNumber}</p>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="text-xs text-secondary">{ticket.ticketType?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTicketAction(ticket.id, "VALID")}
                      disabled={ticket.status === "VALID"}
                      className="p-2 hover:bg-emerald-500/20 text-emerald-400 rounded-lg" title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleTicketAction(ticket.id, "CANCELLED")}
                      disabled={ticket.status === "CANCELLED"}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg" title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleTicketAction(ticket.id, "EXPIRED")}
                      disabled={ticket.status === "EXPIRED"}
                      className="p-2 hover:bg-amber-500/20 text-amber-400 rounded-lg" title="Place on Pending"
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {(!order?.tickets || order.tickets.length === 0) && (
                <p className="text-center py-4 text-xs text-muted italic">No tickets have been issued yet. Approve the order to generate tickets.</p>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-6">
          {/* Payment Status Card */}
          <div className="card p-6 border-l-4 border-amber-500">
             <h3 className="font-bold mb-4 flex items-center gap-2 text-amber-400">
               <AlertTriangle className="w-4 h-4" /> Approval Actions
             </h3>
             
             <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] text-muted uppercase font-bold mb-1.5 block">Payment Reference</label>
                  <input 
                    className="input w-full py-1.5 text-xs" 
                    placeholder="e.g. M-PESA Code, Bank Ref"
                    value={ref}
                    onChange={e => setRef(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted uppercase font-bold mb-1.5 block">Admin Internal Note</label>
                  <textarea 
                    className="input w-full py-1.5 text-xs resize-none" 
                    rows={3}
                    placeholder="Notes for other agents..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>
             </div>

             <div className="flex flex-col gap-2">
                <button 
                  disabled={submitting}
                  onClick={() => handleUpdateStatus("CONFIRMED", "COMPLETED")}
                  className="btn-primary w-full py-2.5 text-xs gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Order
                </button>
                <button 
                   disabled={submitting}
                   onClick={() => handleUpdateStatus("CANCELLED", "FAILED")}
                   className="btn w-full py-2.5 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="w-4 h-4" /> Reject Order
                </button>
             </div>
             
             <p className="text-[10px] text-muted mt-4 text-center">
               Approving the order will mark it as CONFIRMED. You must still manually approve individual tickets.
             </p>
          </div>

          <div className="card p-6 bg-indigo-500/5 border border-indigo-500/20">
             <h3 className="font-bold mb-2 flex items-center gap-2 text-indigo-400">
               <MessageSquare className="w-4 h-4" /> Support Context
             </h3>
             <p className="text-xs text-secondary leading-relaxed">
               This order is awaiting manual payment verification. Please cross-reference the payment reference with the platform's bank records or provider statements before approving.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
