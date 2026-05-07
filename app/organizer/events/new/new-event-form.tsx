"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { Trash2, Plus } from "lucide-react";

interface Venue { id: string; name: string; city: string; }
interface Category { id: string; name: string; }

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
  });

  const [dates, setDates] = useState([{ startDate: "", endDate: "" }]);

  const [ticketTypes, setTicketTypes] = useState([
    { name: "", price: 0, quantity: 100 },
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
    } catch (error: any) {
      toast.error("Creation failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Event Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              required
              className="input w-full"
              placeholder="e.g. Summer Music Festival 2025"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              required
              rows={5}
              className="input w-full resize-none"
              placeholder="Describe your event..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Venue</label>
              <select
                className="input w-full"
                value={formData.venueId}
                onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
              >
                <option value="">— Select a venue —</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · {v.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="input w-full"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">— Select a category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Event Dates</h2>
          <button
            type="button"
            className="text-indigo-400 text-sm flex items-center gap-1"
            onClick={() => setDates([...dates, { startDate: "", endDate: "" }])}
          >
            <Plus className="w-4 h-4" /> Add Date
          </button>
        </div>
        <div className="space-y-4">
          {dates.map((date, index) => (
            <div key={index} className="flex gap-4 items-end bg-white/5 p-4 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Start Date & Time</label>
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
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">End Date & Time</label>
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
                className="p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                onClick={() => setDates(dates.filter((_, i) => i !== index))}
                disabled={dates.length === 1}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Ticket Types */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ticket Types & Pricing</h2>
          <button
            type="button"
            className="text-emerald-400 text-sm flex items-center gap-1"
            onClick={() =>
              setTicketTypes([...ticketTypes, { name: "", price: 0, quantity: 100 }])
            }
          >
            <Plus className="w-4 h-4" /> Add Ticket Type
          </button>
        </div>
        <div className="space-y-4">
          {ticketTypes.map((ticket, index) => (
            <div key={index} className="flex gap-4 items-end bg-white/5 p-4 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="input w-full"
                  placeholder="e.g. General Admission"
                  value={ticket.name}
                  onChange={(e) => {
                    const t = [...ticketTypes];
                    t[index].name = e.target.value;
                    setTicketTypes(t);
                  }}
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium mb-1">Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="input w-full"
                  value={ticket.price}
                  onChange={(e) => {
                    const t = [...ticketTypes];
                    t[index].price = parseFloat(e.target.value);
                    setTicketTypes(t);
                  }}
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="input w-full"
                  value={ticket.quantity}
                  onChange={(e) => {
                    const t = [...ticketTypes];
                    t[index].quantity = parseInt(e.target.value);
                    setTicketTypes(t);
                  }}
                />
              </div>
              <button
                type="button"
                className="p-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                onClick={() => setTicketTypes(ticketTypes.filter((_, i) => i !== index))}
                disabled={ticketTypes.length === 1}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={() => router.push("/organizer")}
          className="btn py-3 px-6 border border-white/20 hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary py-3 px-8"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>
    </form>
  );
}
