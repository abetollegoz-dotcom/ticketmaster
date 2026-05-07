"use client";

type BadgeVariant =
  | "PUBLISHED" | "DRAFT" | "PENDING_APPROVAL" | "CANCELLED" | "POSTPONED" | "COMPLETED" | "SUSPENDED"
  | "CONFIRMED" | "PENDING" | "REFUNDED" | "PARTIALLY_REFUNDED"
  | "VALID" | "USED" | "TRANSFERRED" | "EXPIRED"
  | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
  | "FAILED" | "PROCESSING"
  | string;

const MAP: Record<string, { bg: string; text: string; label?: string }> = {
  // Event
  PUBLISHED:       { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  DRAFT:           { bg: "bg-white/10",       text: "text-slate-400" },
  PENDING_APPROVAL:{ bg: "bg-amber-500/15",   text: "text-amber-400", label: "Pending" },
  CANCELLED:       { bg: "bg-red-500/15",     text: "text-red-400" },
  POSTPONED:       { bg: "bg-orange-500/15",  text: "text-orange-400" },
  COMPLETED:       { bg: "bg-blue-500/15",    text: "text-blue-400" },
  SUSPENDED:       { bg: "bg-pink-500/15",    text: "text-pink-400" },
  // Order
  CONFIRMED:       { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  PENDING:         { bg: "bg-amber-500/15",   text: "text-amber-400" },
  REFUNDED:        { bg: "bg-blue-500/15",    text: "text-blue-400" },
  PARTIALLY_REFUNDED: { bg: "bg-purple-500/15", text: "text-purple-400", label: "Part. Refunded" },
  // Payment
  PROCESSING:      { bg: "bg-indigo-500/15",  text: "text-indigo-400" },
  FAILED:          { bg: "bg-red-500/15",     text: "text-red-400" },
  // Ticket
  VALID:           { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  USED:            { bg: "bg-slate-500/15",   text: "text-slate-400" },
  TRANSFERRED:     { bg: "bg-purple-500/15",  text: "text-purple-400" },
  EXPIRED:         { bg: "bg-red-500/15",     text: "text-red-400" },
  // Support
  OPEN:            { bg: "bg-amber-500/15",   text: "text-amber-400" },
  IN_PROGRESS:     { bg: "bg-blue-500/15",    text: "text-blue-400", label: "In Progress" },
  RESOLVED:        { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  CLOSED:          { bg: "bg-slate-500/15",   text: "text-slate-400" },
};

export function StatusBadge({ status, className = "" }: { status: BadgeVariant; className?: string }) {
  const cfg = MAP[status] ?? { bg: "bg-white/10", text: "text-muted" };
  const label = cfg.label ?? status.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text} ${className}`}>
      {label}
    </span>
  );
}
