"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Ticket, Calendar, MapPin, Download, Share2,
  X, CheckCircle, Clock, AlertTriangle, Loader2, QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import Image from "next/image";
import { toast } from "@/components/ui/toaster";

interface TicketItem {
  id: string;
  ticketNumber: string;
  qrCode: string;
  status: string;
  ticketType: { name: string; category: string };
  order: {
    orderNumber: string;
    items: { event: { title: string; images: string[] }; eventDate: { startDate: string } | null }[];
  };
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  VALID:       { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle },
  USED:        { color: "text-slate-400",   bg: "bg-slate-500/10",   icon: CheckCircle },
  TRANSFERRED: { color: "text-amber-400",   bg: "bg-amber-500/10",   icon: AlertTriangle },
  REFUNDED:    { color: "text-rose-400",    bg: "bg-rose-500/10",    icon: AlertTriangle },
  EXPIRED:     { color: "text-slate-500",   bg: "bg-slate-500/10",   icon: Clock },
};

// ── Live QR canvas component ─────────────────────────────────────
function LiveQR({ payload }: { payload: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!payload) return;
    setLoading(true);
    setError(false);

    // Dynamically import qrcode to keep it client-only
    import("qrcode").then((QRCode) => {
      if (!canvasRef.current) return;
      QRCode.default
        .toCanvas(canvasRef.current, payload, {
          errorCorrectionLevel: "H",
          margin: 2,
          width: 220,
          color: { dark: "#1e1b4b", light: "#ffffff" },
        })
        .then(() => setLoading(false))
        .catch(() => { setError(true); setLoading(false); });
    });
  }, [payload]);

  return (
    <div className="relative flex items-center justify-center bg-white rounded-2xl p-4 shadow-xl shadow-indigo-500/10" style={{ width: 252, height: 252 }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white gap-2">
          <QrCode className="w-10 h-10 text-slate-300" />
          <span className="text-xs text-slate-400">QR unavailable</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`rounded-xl transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  );
}

// ── Download helpers ──────────────────────────────────────────────
async function downloadTicketPDF(ticketId: string, ticketNumber: string) {
  const res = await fetch(`/api/tickets/${ticketId}/download`);
  if (!res.ok) throw new Error("Failed to generate PDF");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ticket-${ticketNumber}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main page ─────────────────────────────────────────────────────
export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTickets(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDownload = useCallback(async () => {
    if (!selectedTicket) return;
    setDownloading(true);
    try {
      await downloadTicketPDF(selectedTicket.id, selectedTicket.ticketNumber);
      toast.success("Ticket PDF downloaded!");
    } catch {
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [selectedTicket]);

  if (loading) {
    return (
      <div className="container py-12">
        <div className="h-10 w-48 bg-white/5 rounded-xl mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white/5 h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="container py-24 text-center">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ticket className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4">No tickets yet</h1>
        <p className="text-secondary mb-8">You haven&apos;t purchased any tickets yet.</p>
        <a href="/events" className="btn-primary py-3 px-8 inline-block">Browse Events</a>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <span className="badge badge-brand">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => {
          const item = ticket.order.items[0];
          const event = item.event;
          const status = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.VALID;
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={ticket.id}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="card overflow-hidden cursor-pointer group"
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="relative h-44">
                <Image
                  src={event.images[0] || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${status.bg} ${status.color} border border-current/20`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="badge badge-brand mb-1">{ticket.ticketType.name}</span>
                  <h3 className="text-white font-bold text-lg leading-tight">{event.title}</h3>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3">
                {item.eventDate && (
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <Calendar className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    {formatDateShort(item.eventDate.startDate)}
                  </div>
                )}
                <div className="flex justify-between items-center mt-1 pt-3 border-t border-white/5">
                  <span className="text-xs text-muted font-mono">#{ticket.ticketNumber}</span>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${status.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {ticket.status}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Ticket Detail Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {selectedTicket && (() => {
          const item = selectedTicket.order.items[0];
          const event = item.event;
          const status = STATUS_CONFIG[selectedTicket.status] ?? STATUS_CONFIG.VALID;

          return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setSelectedTicket(null)}
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="glass-dark w-full max-w-md rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl shadow-indigo-500/20"
              >
                {/* Close button */}
                <button
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  onClick={() => setSelectedTicket(null)}
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Hero image */}
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={event.images[0] || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"}
                    fill
                    className="object-cover"
                    alt={event.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.color} border border-current/20 mb-1`}>
                      <status.icon className="w-3 h-3" />
                      {selectedTicket.status}
                    </div>
                    <p className="text-indigo-300 text-sm font-semibold">{selectedTicket.ticketType.name}</p>
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-bold mb-1">{event.title}</h2>
                  {item.eventDate && (
                    <p className="text-secondary text-sm mb-5 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      {formatDateShort(item.eventDate.startDate)}
                    </p>
                  )}

                  {/* Live QR Code */}
                  <div className="flex flex-col items-center mb-5">
                    <p className="text-xs text-muted mb-3 flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5" />
                      Real-time generated QR code — show at entry
                    </p>
                    <LiveQR payload={selectedTicket.qrCode} />
                  </div>

                  {/* Ticket details */}
                  <div className="flex flex-col gap-0 w-full text-sm mb-5 rounded-xl overflow-hidden border border-white/8">
                    <div className="flex justify-between py-2.5 px-3 bg-white/3">
                      <span className="text-muted">Ticket Number</span>
                      <span className="font-mono text-xs">{selectedTicket.ticketNumber}</span>
                    </div>
                    <div className="flex justify-between py-2.5 px-3">
                      <span className="text-muted">Order Reference</span>
                      <span className="font-mono text-xs">{selectedTicket.order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between py-2.5 px-3 bg-white/3">
                      <span className="text-muted">Ticket Type</span>
                      <span className="font-semibold">{selectedTicket.ticketType.name}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="btn-primary flex-1 py-3 gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {downloading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                      ) : (
                        <><Download className="w-4 h-4" /> Download PDF</>
                      )}
                    </button>
                    <button className="btn-ghost flex-1 py-3 gap-2 text-sm">
                      <Share2 className="w-4 h-4" /> Transfer
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
