"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, Clock, Plus, Trash2, Save, 
  ChevronRight, Building2, Ticket, 
  Layout, CreditCard, ChevronDown, Info
} from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { motion, AnimatePresence } from "framer-motion";

interface NewEventFormProps {
  venues: { id: string; name: string; city: string }[];
  categories: { id: string; name: string }[];
}

const PROVIDERS = [
  { value: "", label: "None (Standard Checkout)" },
  { value: "STRIPE", label: "Stripe" },
  { value: "PAYPAL", label: "PayPal" },
  { value: "MPESA", label: "M-Pesa" },
  { value: "DIRECT_BANK", label: "Direct Bank Transfer" },
];

export default function NewEventForm({ venues, categories }: NewEventFormProps) {
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
    { name: "General Admission", category: "GENERAL", price: 0, originalPrice: null as number | null, quantity: 100 }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.venueId) return toast.error("Selection Required", "Please select a venue");
    if (!formData.categoryId) return toast.error("Selection Required", "Please select a category");
    
    setLoading(true);
    try {
      const res = await fetch("/api/events/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, dates, ticketTypes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");

      toast.success("Event created successfully!");
      router.push("/organizer/events");
      router.refresh();
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24">
      {/* Step 1: Basics */}
      <div className="card p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">1</span>
          Event Basics
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted">Event Title</label>
            <input
              required
              placeholder="e.g. Summer Music Festival 2026"
              className="input w-full bg-white/2"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-muted">Detailed Description</label>
            <textarea
              required
              rows={4}
              placeholder="What makes this event special?"
              className="input w-full bg-white/2 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Venue</label>
              <div className="relative">
                <select
                  required
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
                  required
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
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    type="datetime-local"
                    required
                    className="input w-full pl-10 cursor-pointer"
                    value={date.startDate}
                    onClick={(e) => e.currentTarget.showPicker()}
                    onChange={(e) => {
                      const newDates = [...dates];
                      newDates[index].startDate = e.target.value;
                      setDates(newDates);
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">End Date & Time</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                  <input
                    type="datetime-local"
                    required
                    className="input w-full pl-10 cursor-pointer"
                    value={date.endDate}
                    onClick={(e) => e.currentTarget.showPicker()}
                    onChange={(e) => {
                      const newDates = [...dates];
                      newDates[index].endDate = e.target.value;
                      setDates(newDates);
                    }}
                  />
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

      {/* Step 3: Tickets */}
      <div className="card p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-bold">3</span>
            Ticket Packages
          </h2>
          <button
            type="button"
            className="text-indigo-400 text-sm font-bold flex items-center gap-1 hover:underline"
            onClick={() => setTicketTypes([...ticketTypes, { name: "", category: "GENERAL", price: 0, originalPrice: null, quantity: 100 }])}
          >
            <Plus className="w-4 h-4" /> Add Package
          </button>
        </div>
        <div className="space-y-4">
          {ticketTypes.map((ticket, index) => (
            <div key={index} className="p-6 rounded-2xl bg-white/2 border border-white/5 space-y-4 relative group">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Ticket Name</label>
                  <input
                    required
                    placeholder="e.g. VIP Backstage"
                    className="input w-full"
                    value={ticket.name}
                    onChange={(e) => {
                      const newTickets = [...ticketTypes];
                      newTickets[index].name = e.target.value;
                      setTicketTypes(newTickets);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Price</label>
                  <input
                    type="number"
                    required
                    className="input w-full"
                    value={ticket.price}
                    onChange={(e) => {
                      const newTickets = [...ticketTypes];
                      newTickets[index].price = parseFloat(e.target.value);
                      setTicketTypes(newTickets);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Original Price (optional)</label>
                  <input
                    type="number"
                    placeholder="Strike-through price"
                    className="input w-full"
                    value={ticket.originalPrice || ""}
                    onChange={(e) => {
                      const newTickets = [...ticketTypes];
                      newTickets[index].originalPrice = e.target.value ? parseFloat(e.target.value) : null;
                      setTicketTypes(newTickets);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Inventory</label>
                  <input
                    type="number"
                    required
                    className="input w-full"
                    value={ticket.quantity}
                    onChange={(e) => {
                      const newTickets = [...ticketTypes];
                      newTickets[index].quantity = parseInt(e.target.value);
                      setTicketTypes(newTickets);
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                {ticketTypes.length > 1 && (
                  <button
                    type="button"
                    className="text-xs text-red-400 font-bold flex items-center gap-1 hover:underline"
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

      <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-ghost px-8 py-4 bg-bg-surface backdrop-blur-xl shadow-2xl"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-12 py-4 shadow-2xl shadow-indigo-500/40"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Creating Event...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Launch Event
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
