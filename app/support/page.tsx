"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, MessageSquare, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatRelative } from "date-fns";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetch("/api/support/tickets")
      .then(res => res.json())
      .then(json => {
        setTickets(json.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container py-20 text-center">Loading tickets...</div>;

  return (
    <div className="container py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Support Center</h1>
          <p className="text-secondary">Track your inquiries and payment fallback requests.</p>
        </div>
        <Link href="/support/new" className="btn-primary py-3 px-6 gap-2">
          <Plus className="w-5 h-5" /> New Ticket
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tickets.length === 0 ? (
          <div className="card p-12 text-center text-muted">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No active support tickets.</p>
          </div>
        ) : (
          tickets.map(ticket => (
            <Link 
              key={ticket.id} 
              href={`/support/${ticket.id}`}
              className="card p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-500/50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${
                    ticket.status === "OPEN" ? "bg-amber-400" :
                    ticket.status === "IN_PROGRESS" ? "bg-blue-400" :
                    "bg-emerald-400"
                  }`} />
                  <h3 className="font-bold">{ticket.subject}</h3>
                </div>
                <p className="text-sm text-secondary line-clamp-1">{ticket.message}</p>
                <p className="text-[10px] text-muted mt-2 uppercase tracking-wider">
                  Ticket #{ticket.id.slice(-6).toUpperCase()} • {ticket.category}
                </p>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-secondary uppercase">{ticket.status.replace("_", " ")}</p>
                  <p className="text-[10px] text-muted flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" /> {formatRelative(new Date(ticket.createdAt), new Date())}
                  </p>
                </div>
                <div className="p-2 bg-white/5 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
