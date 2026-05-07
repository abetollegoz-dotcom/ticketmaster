"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { Trash2, Plus, ChevronDown, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const PROVIDERS = [
  { value: "", label: "None (Use Default)" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "MOLLIE", label: "Mollie" },
  { value: "STRIPE", label: "Stripe (alternate account)" },
];

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "POSTPONED", label: "Postponed" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function EventEditForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description,
    status: initialData.status,
    fallbackProvider: initialData.fallbackProvider || "",
  });

  const [dates, setDates] = useState<any[]>(
    initialData.dates.map((d: any) => ({
      id: d.id,
      startDate: new Date(d.startDate).toISOString().slice(0, 16),
      endDate: new Date(d.endDate).toISOString().slice(0, 16),
    }))
  );

  const [ticketTypes, setTicketTypes] = useState<any[]>(initialData.ticketTypes);
  const [postponeReason, setPostponeReason] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal state
  const [cancelModal, setCancelModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [postponeModal, setPostponeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const router = useRouter();
  const isPostponing = formData.status === "POSTPONED";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/events/manage/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fallbackProvider: formData.fallbackProvider || null,
          dates,
          ticketTypes,
          postponeReason: isPostponing ? postponeReason : undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update event");
      }

      toast.success("Event updated successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error("Update failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/manage/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED", dates, ticketTypes }),
      });
      if (!res.ok) throw new Error("Failed to cancel event");
      toast.success("Event cancelled.");
      setCancelModal(false);
      router.push("/organizer");
    } catch (error: any) {
      toast.error("Cancel failed", error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/manage/${initialData.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
      toast.success("Event removed successfully.");
      setDeleteModal(false);
      router.push("/organizer");
    } catch (error: any) {
      toast.error("Delete failed", error.message);
      setActionLoading(false);
    }
  };

  const updateTicket = (index: number, field: string, value: any) => {
    const newTickets = [...ticketTypes];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setTicketTypes(newTickets);
  };

  const updateDate = (index: number, field: string, value: string) => {
    const newDates = [...dates];
    newDates[index] = { ...newDates[index], [field]: value };
    setDates(newDates);
  };

  return (
    <>
      {/* Cancel Confirmation */}
      <ConfirmModal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        onConfirm={handleCancel}
        title="Cancel Event"
        description="Are you sure you want to cancel this event? Ticket holders will be notified. This is a soft cancellation — tickets remain in the system but are flagged for manual refund."
        confirmLabel="Yes, Cancel Event"
        variant="danger"
        loading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Event"
        description="Events with existing orders will be cancelled instead of deleted. Events with no orders will be permanently removed. This cannot be undone."
        confirmLabel="Delete / Cancel"
        variant="danger"
        loading={actionLoading}
      />

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">1</span>
            Event Details
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title</label>
              <input
                type="text"
                required
                className="input w-full"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea
                required
                rows={4}
                className="input w-full resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Status</label>
                <div className="relative">
                  <select
                    className="input w-full appearance-none pr-10"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-400" /> Fallback Payment Provider
                </label>
                <div className="relative">
                  <select
                    className="input w-full appearance-none pr-10"
                    value={formData.fallbackProvider}
                    onChange={(e) => setFormData({ ...formData, fallbackProvider: e.target.value })}
                  >
                    {PROVIDERS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                </div>
                <p className="text-[11px] text-muted mt-1.5">Used if the primary payment processor fails at checkout.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Postpone reason — shown when status = POSTPONED */}
        {isPostponing && (
          <div className="card p-6 border border-orange-500/30 bg-orange-500/5">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-orange-400">Postponing Event</h3>
                <p className="text-sm text-secondary mt-1">New dates are required below. Ticket holders will be notified of the change.</p>
              </div>
            </div>
            <label className="block text-sm font-medium mb-1.5">Reason for Postponement</label>
            <textarea
              rows={2}
              className="input w-full resize-none"
              placeholder="e.g. Venue unavailability, artist scheduling conflict..."
              value={postponeReason}
              onChange={(e) => setPostponeReason(e.target.value)}
            />
          </div>
        )}

        {/* Dates */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">2</span>
              Event Dates {isPostponing && <span className="text-orange-400 text-sm font-normal ml-2">— New dates required</span>}
            </h2>
            <button
              type="button"
              className="text-indigo-400 text-sm flex items-center gap-1 hover:text-indigo-300 transition-colors"
              onClick={() => setDates([...dates, { startDate: "", endDate: "" }])}
            >
              <Plus className="w-4 h-4" /> Add Date
            </button>
          </div>
          <div className="space-y-4">
            {dates.map((date, index) => (
              <div key={index} className="flex gap-4 items-end bg-white/5 p-4 rounded-xl">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="input w-full"
                    value={date.startDate}
                    onChange={(e) => updateDate(index, "startDate", e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    className="input w-full"
                    value={date.endDate}
                    onChange={(e) => updateDate(index, "endDate", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  onClick={() => setDates(dates.filter((_, i) => i !== index))}
                  disabled={dates.length === 1}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Pricing */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">3</span>
              Ticket Types & Pricing
            </h2>
            <button
              type="button"
              className="text-emerald-400 text-sm flex items-center gap-1 hover:text-emerald-300 transition-colors"
              onClick={() => setTicketTypes([...ticketTypes, { name: "", price: 0, originalPrice: null, quantity: 100 }])}
            >
              <Plus className="w-4 h-4" /> Add Ticket
            </button>
          </div>
          <div className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end bg-white/5 p-4 rounded-xl">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={ticket.name}
                    onChange={(e) => updateTicket(index, "name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Type</label>
                  <select
                    className="input w-full"
                    value={ticket.category || "GENERAL"}
                    onChange={(e) => updateTicket(index, "category", e.target.value)}
                  >
                    <option value="GENERAL">General</option>
                    <option value="VIP">VIP</option>
                    <option value="EARLY_BIRD">Early Bird</option>
                    <option value="BACKSTAGE">Backstage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="input w-full"
                    value={ticket.price}
                    onChange={(e) => updateTicket(index, "price", parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Original ($)
                    <span className="ml-1 text-muted font-normal normal-case">strike-through</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input w-full"
                    placeholder="—"
                    value={ticket.originalPrice ?? ""}
                    onChange={(e) => updateTicket(index, "originalPrice", e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wider">Quantity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      required
                      className="input w-full"
                      value={ticket.quantity}
                      onChange={(e) => updateTicket(index, "quantity", parseInt(e.target.value))}
                    />
                    <button
                      type="button"
                      className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors shrink-0"
                      onClick={() => setTicketTypes(ticketTypes.filter((_, i) => i !== index))}
                      disabled={ticketTypes.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3 border-t border-white/10 pt-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCancelModal(true)}
              disabled={loading || actionLoading || formData.status === "CANCELLED"}
              className="btn py-2.5 px-5 text-sm text-orange-400 border border-orange-500/30 hover:bg-orange-500/10 disabled:opacity-40 transition-colors"
            >
              Cancel Event
            </button>
            <button
              type="button"
              onClick={() => setDeleteModal(true)}
              disabled={loading || actionLoading}
              className="btn py-2.5 px-5 text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
            >
              Delete Event
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || actionLoading}
            className="btn-primary py-3 px-8 gap-2"
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </>
  );
}
