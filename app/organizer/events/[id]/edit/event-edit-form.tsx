import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Plus, Trash2, Save, AlertTriangle, ChevronRight, Layout, Ticket as TicketIcon } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { format } from "date-fns";

interface TicketType {
  id?: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  quantity: number;
}

interface EventDate {
  id?: string;
  startDate: string;
  endDate: string;
}

interface EventEditFormProps {
  initialData: {
    id: string;
    title: string;
    description: string;
    status: string;
    dates: EventDate[];
    ticketTypes: TicketType[];
    fallbackProvider?: string | null;
  };
}

export default function EventEditForm({ initialData }: EventEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description,
    status: initialData.status,
    fallbackProvider: initialData.fallbackProvider || "",
    postponeReason: "",
  });

  const [dates, setDates] = useState(initialData.dates.map(d => ({
    ...d,
    startDate: d.startDate ? new Date(d.startDate).toISOString().slice(0, 16) : "",
    endDate: d.endDate ? new Date(d.endDate).toISOString().slice(0, 16) : "",
  })));

  const [ticketTypes, setTicketTypes] = useState(initialData.ticketTypes);

  const isPostponing = formData.status === "POSTPONED";

  const updateDate = (index: number, field: string, value: string) => {
    const newDates = [...dates];
    newDates[index] = { ...newDates[index], [field]: value };
    setDates(newDates);
  };

  const updateTicket = (index: number, field: string, value: any) => {
    const newTickets = [...ticketTypes];
    newTickets[index] = { ...newTickets[index], [field]: value };
    setTicketTypes(newTickets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/events/manage/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dates,
          ticketTypes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      toast.success("Event updated successfully!");
      router.push("/organizer/events");
      router.refresh();
    } catch (err: any) {
      toast.error("Failed to update event", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      <div className="flex flex-col gap-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">1</span>
            General Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-muted">Event Title</label>
              <input
                required
                className="input w-full"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-muted">Description</label>
              <textarea
                required
                rows={4}
                className="input w-full resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted">Status</label>
                <select
                  className="input w-full"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="POSTPONED">Postponed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted">Payment Fallback Provider</label>
                <select
                  className="input w-full"
                  value={formData.fallbackProvider}
                  onChange={(e) => setFormData({ ...formData, fallbackProvider: e.target.value })}
                >
                  <option value="">None (Standard Checkout)</option>
                  <option value="STRIPE">Stripe</option>
                  <option value="PAYPAL">PayPal</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="DIRECT_BANK">Direct Bank Transfer</option>
                </select>
              </div>
            </div>

            {isPostponing && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <label className="block text-sm font-medium mb-1.5 text-orange-400">Reason for Postponing</label>
                <textarea
                  className="input w-full border-orange-500/30"
                  placeholder="e.g., Unforeseen logistics issues..."
                  value={formData.postponeReason}
                  onChange={(e) => setFormData({ ...formData, postponeReason: e.target.value })}
                />
              </motion.div>
            )}
          </div>
        </div>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1.5">Start Date & Time</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                      <input
                        type="datetime-local"
                        required
                        className="input w-full pl-10 cursor-pointer"
                        value={date.startDate}
                        onClick={(e) => e.currentTarget.showPicker()}
                        onChange={(e) => updateDate(index, "startDate", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1.5">End Date & Time</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                      <input
                        type="datetime-local"
                        required
                        className="input w-full pl-10 cursor-pointer"
                        value={date.endDate}
                        onClick={(e) => e.currentTarget.showPicker()}
                        onChange={(e) => updateDate(index, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                {dates.length > 1 && (
                  <button
                    type="button"
                    className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                    onClick={() => setDates(dates.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tickets */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">3</span>
              Ticket Categories
            </h2>
            <button
              type="button"
              className="text-indigo-400 text-sm flex items-center gap-1 hover:text-indigo-300 transition-colors"
              onClick={() => setTicketTypes([...ticketTypes, { name: "", category: "GENERAL", price: 0, quantity: 100 }])}
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>
          <div className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <div key={index} className="bg-white/2 p-6 rounded-xl border border-white/5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted">Ticket Name</label>
                    <input
                      required
                      placeholder="e.g. VIP Early Bird"
                      className="input w-full"
                      value={ticket.name}
                      onChange={(e) => updateTicket(index, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted">Price</label>
                    <input
                      type="number"
                      required
                      className="input w-full"
                      value={ticket.price}
                      onChange={(e) => updateTicket(index, "price", parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted">Original Price (Strike-through)</label>
                    <input
                      type="number"
                      placeholder="Optional"
                      className="input w-full"
                      value={ticket.originalPrice || ""}
                      onChange={(e) => updateTicket(index, "originalPrice", e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted">Quantity</label>
                    <input
                      type="number"
                      required
                      className="input w-full"
                      value={ticket.quantity}
                      onChange={(e) => updateTicket(index, "quantity", parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  {ticketTypes.length > 1 && (
                    <button
                      type="button"
                      className="text-xs text-red-400 hover:underline flex items-center gap-1"
                      onClick={() => setTicketTypes(ticketTypes.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove category
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex items-center gap-4 z-50">
        <button
          type="button"
          className="btn-ghost px-8 py-3 bg-bg-surface"
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-10 py-3 shadow-xl shadow-indigo-500/20"
        >
          <Save className="w-5 h-5" />
          {loading ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
