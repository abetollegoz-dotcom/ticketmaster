"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Send, User, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatRelative } from "date-fns";
import { toast } from "@/components/ui/toaster";

export default function TicketChatPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchTicket = async () => {
    const res = await fetch(`/api/support/tickets/${id}`);
    const json = await res.json();
    if (json.success) {
      setTicket(json.data);
      setReplies(json.data.replies);
    }
  };

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [replies]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) throw new Error("Failed to send");

      setMessage("");
      fetchTicket();
    } catch (err) {
      toast.error("Error", "Could not send message");
    } finally {
      setSending(false);
    }
  };

  if (!ticket) return <div className="container py-24 text-center">Loading conversation...</div>;

  return (
    <div className="container py-12 max-w-4xl h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/support" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <p className="text-xs text-muted flex items-center gap-2">
              Status: <span className="text-indigo-400 font-bold">{ticket.status}</span> • 
              Priority: <span className={ticket.priority === "HIGH" ? "text-red-400" : "text-secondary"}>{ticket.priority}</span>
            </p>
          </div>
        </div>
        {["ADMIN", "SUPER_ADMIN", "SUPPORT_AGENT"].includes(session?.user?.role || "") && ticket.status !== "RESOLVED" && (
          <button 
            onClick={() => {
              fetch(`/api/support/tickets/${id}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "This ticket has been marked as resolved.", status: "RESOLVED" }),
              }).then(() => fetchTicket());
            }}
            className="btn py-2 px-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase"
          >
            Mark Resolved
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto card p-6 space-y-6 mb-4">
        {/* Original Message */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold">{ticket.user.name}</span>
              <span className="text-[10px] text-muted">{formatRelative(new Date(ticket.createdAt), new Date())}</span>
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 text-sm">
              {ticket.message}
            </div>
          </div>
        </div>

        {/* Replies */}
        {replies.map((reply: any) => (
          <div key={reply.id} className={`flex gap-4 ${reply.isStaff ? "flex-row-reverse" : ""}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              reply.isStaff ? "bg-emerald-500/20" : "bg-indigo-500/20"
            }`}>
              {reply.isStaff ? <Shield className="w-5 h-5 text-emerald-400" /> : <User className="w-5 h-5 text-indigo-400" />}
            </div>
            <div className={`flex-1 ${reply.isStaff ? "text-right" : ""}`}>
              <div className={`flex items-center gap-2 mb-1 ${reply.isStaff ? "justify-end" : "justify-start"}`}>
                {reply.isStaff && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">STAFF</span>}
                <span className="text-sm font-bold">{reply.isStaff ? "Support Agent" : ticket.user.name}</span>
                <span className="text-[10px] text-muted">{formatRelative(new Date(reply.createdAt), new Date())}</span>
              </div>
              <div className={`p-4 rounded-2xl text-sm ${
                reply.isStaff 
                  ? "bg-emerald-500/10 border border-emerald-500/20 rounded-tr-none text-left" 
                  : "bg-white/5 border border-white/5 rounded-tl-none"
              }`}>
                {reply.message}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="relative">
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..." 
          className="w-full pl-6 pr-16 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 transition-colors outline-none"
        />
        <button 
          type="submit"
          disabled={sending || !message.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
