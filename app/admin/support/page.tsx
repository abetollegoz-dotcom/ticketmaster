"use client";
import { useState, useEffect } from "react";
import { Search, Filter, MessageSquare, Clock, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { formatRelative } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export default function AdminSupportDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/support/tickets")
      .then(res => res.json())
      .then(json => {
        setTickets(json.data);
        setLoading(false);
      });
  }, []);

  const filteredTickets = tickets.filter(t => {
    if (filter === "ALL") return true;
    if (filter === "OPEN") return t.status === "OPEN";
    if (filter === "PAYMENT") return t.category === "Payment";
    return true;
  });

  if (loading) return <div className="container py-24 text-center">Loading Support Queue...</div>;

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Support Management</h1>
          <p className="text-secondary">Manage customer inquiries and payment fallback requests.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <button 
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === "ALL" ? "bg-indigo-500 text-white" : "bg-white/5"}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter("OPEN")}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === "OPEN" ? "bg-indigo-500 text-white" : "bg-white/5"}`}
          >
            Open
          </button>
          <button 
            onClick={() => setFilter("PAYMENT")}
            className={`px-4 py-2 rounded-lg transition-colors ${filter === "PAYMENT" ? "bg-indigo-500 text-white" : "bg-white/5"}`}
          >
            Payment Issues
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-white/2 text-muted uppercase text-[10px] font-bold tracking-wider border-b border-white/5">
              <th className="px-6 py-4">Ticket</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTickets.map(ticket => (
              <tr key={ticket.id} className="hover:bg-white/2 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-semibold group-hover:text-indigo-400 transition-colors">{ticket.subject}</p>
                  <p className="text-[10px] text-muted line-clamp-1">{ticket.message}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm">{ticket.user.name}</p>
                  <p className="text-[10px] text-muted">{ticket.user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ticket.category === "Payment" ? "bg-red-500/10 text-red-400" : "bg-white/10 text-secondary"
                  }`}>
                    {ticket.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    ticket.status === "OPEN" ? "bg-amber-500/10 text-amber-400" :
                    ticket.status === "IN_PROGRESS" ? "bg-blue-500/10 text-blue-400" :
                    "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link 
                    href={`/support/${ticket.id}`} 
                    className="btn-ghost py-1.5 px-4 text-xs inline-flex items-center gap-2"
                  >
                    Reply <MessageSquare className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTickets.length === 0 && (
          <div className="p-12 text-center text-muted">No tickets found for this filter.</div>
        )}
      </div>
    </div>
  );
}
