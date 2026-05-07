"use client";
import { useState, useEffect } from "react";
import { Ticket, Calendar, MapPin, Download, Share2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import Image from "next/image";
import { toast } from "@/components/ui/toaster";

interface Ticket {
  id: string;
  ticketNumber: string;
  qrCode: string;
  status: string;
  ticketType: { name: string; category: string };
  order: {
    orderNumber: string;
    items: { event: { title: string; images: string[] }; eventDate: { startDate: string } }[];
  };
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    fetch("/api/tickets")
      .then(res => res.json())
      .then(data => {
        if (data.success) setTickets(data.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container py-12"><div className="skeleton w-full h-64 rounded-2xl" /></div>;

  if (tickets.length === 0) {
    return (
      <div className="container py-24 text-center">
        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ticket className="w-10 h-10 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold mb-4">No tickets yet</h1>
        <p className="text-secondary mb-8">You haven't purchased any tickets yet.</p>
        <a href="/events" className="btn-primary py-3 px-8 inline-block">Browse Events</a>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">My Tickets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.map((ticket) => {
          const item = ticket.order.items[0];
          const event = item.event;
          return (
            <motion.div
              key={ticket.id}
              whileHover={{ y: -4 }}
              className="card overflow-hidden cursor-pointer"
              onClick={() => setSelectedTicket(ticket)}
            >
              <div className="relative h-40">
                <Image src={event.images[0] || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"} alt={event.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="badge badge-brand mb-1">{ticket.ticketType.name}</span>
                  <h3 className="text-white font-bold">{event.title}</h3>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  <Calendar className="w-4 h-4" /> {item.eventDate ? formatDateShort(item.eventDate.startDate) : "TBD"}
                </div>
                <div className="flex justify-between items-center mt-2 pt-3 border-t border-white/5">
                  <span className="text-xs text-muted">Ticket #{ticket.ticketNumber}</span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${ticket.status === "VALID" ? "text-emerald-400" : "text-amber-400"}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedTicket(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-dark w-full max-w-md rounded-3xl overflow-hidden relative border border-white/10"
            >
              <div className="p-8 text-center flex flex-col items-center">
                <div className="w-full h-48 relative rounded-2xl overflow-hidden mb-6">
                  <Image src={selectedTicket.order.items[0].event.images[0] || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"} fill className="object-cover" alt="Event" />
                </div>
                <h2 className="text-2xl font-bold mb-1">{selectedTicket.order.items[0].event.title}</h2>
                <p className="text-indigo-400 font-semibold mb-6">{selectedTicket.ticketType.name}</p>
                
                <div className="bg-white p-4 rounded-2xl mb-6 shadow-xl shadow-indigo-500/10">
                  <Image src={selectedTicket.qrCode} alt="QR Code" width={200} height={200} />
                </div>

                <div className="flex flex-col gap-2 w-full text-sm mb-8">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-muted">Ticket Number</span>
                    <span className="font-mono">{selectedTicket.ticketNumber}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-muted">Order Ref</span>
                    <span className="font-mono">{selectedTicket.order.orderNumber}</span>
                  </div>
                </div>

                <div className="flex gap-4 w-full">
                  <button className="btn-primary flex-1 py-3 gap-2 text-sm">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  <button className="btn-ghost flex-1 py-3 gap-2 text-sm">
                    <Share2 className="w-4 h-4" /> Transfer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
