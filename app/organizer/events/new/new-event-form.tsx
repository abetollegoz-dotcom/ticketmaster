"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { Trash2, Plus, ChevronDown, Calendar, CreditCard, Info } from "lucide-react";

interface Venue { id: string; name: string; city: string; }
interface Category { id: string; name: string; }

const PROVIDERS = [
  { value: "", label: "None (Use Default)" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "MOLLIE", label: "Mollie" },
  { value: "STRIPE", label: "Stripe (alternate account)" },
];

export default function NewEventForm({
  venues,
  categories,
}: {
  venues: Venue[];
  categories: Category[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    venueId: "",
    categoryId: "",
    fallbackProvider: "",
  });

  const [dates, setDates] = useState([{ startDate: "", endDate: "" }]);

  const [ticketTypes, setTicketTypes] = useState([
    { name: "", category: "GENERAL", price: 0, originalPrice: null as number | null, quantity: 100 },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/events/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          venueId: formData.venueId || undefined,
          categoryId: formData.categoryId || undefined,
          fallbackProvider: formData.fallbackProvider || null,
          dates,
          ticketTypes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create event");
      }

      toast.success("Event created successfully!");
      router.push("/organizer");
      router.refresh();
    } catch (error: any) {
      toast.error("Creation failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTicket = (index: number, field: string, value: any) => {
    const t = [...ticketTypes];
    t[index] = { ...t[index], [field]: value };
    setTicketTypes(t);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step 1: Basic Info */}
      <div className="card p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">1</span>
          Basic Information
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted">Event Title *</label>
            <input
              type="text"
              required
              className="input w-full py-3"
              placeholder="e.g. Grand Opening Night"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-muted">Description *</label>
            <textarea
              required
              rows={4}
              className="input w-full resize-none"
              placeholder="Tell people what to expect..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Venue</label>
              <div className="relative">
                <select
                  className="input w-full appearance-none pr-10"
                  value={formData.venueId}
                  onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                >
                  <option value="">— Select a venue —</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} · {v.city}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Category</label>
              <div className="relative">
                <select
                  className="input w-full appearance-none pr-10"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">— Select a category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-muted flex items-center gap-1.5">
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
            <p className="text-[10px] text-muted mt-2 leading-relaxed">Optional: Choose an alternative payment gateway if the primary one fails during high traffic.</p>
          </div>
        </div>
      </div>

      {/* Step 2: Dates */}
      <div className="card p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">2</span>
            Event Schedule
          </h2>
          <button
            type="button"
            className="text-indigo-400 text-sm font-bold flex items-center gap-1 hover:underline"
            onClick={() => setDates([...dates, { startDate: "", endDate: "" }])}
          >
            <Plus className="w-4 h-4" /> Add Date
          </button>
        </div>
        <div className="space-y-4">
          {dates.map((date, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-4 items-end bg-white/5 p-4 rounded-2xl relative group">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Start Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="input w-full"
                  value={date.startDate}
                  onChange={(e) => {
                    const newDates = [...dates];
                    newDates[index].startDate = e.target.value;
                    setDates(newDates);
                  }}
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">End Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="input w-full"
                  value={date.endDate}
                  onChange={(e) => {
                    const newDates = [...dates];
                    newDates[index].endDate = e.target.value;
                    setDates(newDates);
                  }}
                />
              </div>
              <button
                type="button"
                className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-0"
                onClick={() => setDates(dates.filter((_, i) => i !== index))}
                disabled={dates.length === 1}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Step 3: Tickets */}
      <div className="card p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">3</span>
            Tickets & Pricing
          </h2>
          <button
            type="button"
            className="text-emerald-400 text-sm font-bold flex items-center gap-1 hover:underline"
            onClick={() =>
              setTicketTypes([...ticketTypes, { name: "", category: "GENERAL", price: 0, originalPrice: null, quantity: 100 }])
            }
          >
            <Plus className="w-4 h-4" /> Add Ticket Type
          </button>
        </div>
        <div className="space-y-4">
          {ticketTypes.map((ticket, index) => (
            <div key={index} className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end bg-white/5 p-5 rounded-2xl relative group">
              <div className="col-span-2 lg:col-span-1">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Ticket Name</label>
                <input
                  type="text"
                  required
                  className="input w-full"
                  placeholder="e.g. VIP Access"
                  value={ticket.name}
                  onChange={(e) => updateTicket(index, "name", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Category</label>
                <select
                  className="input w-full"
                  value={ticket.category}
                  onChange={(e) => updateTicket(index, "category", e.target.value)}
                >
                  <option value="GENERAL">General</option>
                  <option value="VIP">VIP</option>
                  <option value="EARLY_BIRD">Early Bird</option>
                  <option value="BACKSTAGE">Backstage</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Sale Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="input w-full font-bold"
                  value={ticket.price}
                  onChange={(e) => updateTicket(index, "price", parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Strike Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input w-full opacity-60"
                  placeholder="Optional"
                  value={ticket.originalPrice ?? ""}
                  onChange={(e) => updateTicket(index, "originalPrice", e.target.value ? parseFloat(e.target.value) : null)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Quantity</label>
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
                    className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-0"
                    onClick={() => setTicketTypes(ticketTypes.filter((_, i) => i !== index))}
                    disabled={ticketTypes.length === 1}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center bg-indigo-500/5 p-6 rounded-2xl border border-indigo-500/10">
        <div className="flex items-center gap-3 text-indigo-400">
          <Info className="w-5 h-5 shrink-0" />
          <p className="text-xs font-medium leading-relaxed">
            Your event will be set to <span className="font-bold">PUBLISHED</span> immediately after creation. 
            You can change this to DRAFT later in the settings.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push("/organizer")}
            className="btn py-3 px-8 border border-white/10 hover:bg-white/5 transition-all text-sm font-bold"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-10 shadow-xl shadow-indigo-500/20 text-sm"
          >
            {loading ? "Creating..." : "Launch Event"}
          </button>
        </div>
      </div>
    </form>
  );
}
