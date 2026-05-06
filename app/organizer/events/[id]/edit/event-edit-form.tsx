"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { Trash2, Plus } from "lucide-react";

export default function EventEditForm({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState({
    title: initialData.title,
    description: initialData.description,
    status: initialData.status,
  });

  const [dates, setDates] = useState<any[]>(
    initialData.dates.map((d: any) => ({
      id: d.id,
      startDate: new Date(d.startDate).toISOString().slice(0, 16),
      endDate: new Date(d.endDate).toISOString().slice(0, 16),
    }))
  );

  const [ticketTypes, setTicketTypes] = useState<any[]>(initialData.ticketTypes);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete or cancel this event? This action cannot be undone.")) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/manage/${initialData.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete event");
      }

      toast.success("Event removed successfully.");
      router.push("/organizer");
    } catch (error: any) {
      toast.error("Delete failed", error.message);
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Basic Info */}
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Event Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              required
              rows={4}
              className="input w-full resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="input w-full"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dates (Postpone) */}
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

      {/* Ticket Pricing */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ticket Types & Pricing</h2>
          <button 
            type="button" 
            className="text-emerald-400 text-sm flex items-center gap-1"
            onClick={() => setTicketTypes([...ticketTypes, { name: "", price: 0, quantity: 100 }])}
          >
            <Plus className="w-4 h-4" /> Add Ticket
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
                  value={ticket.name}
                  onChange={(e) => {
                    const newTickets = [...ticketTypes];
                    newTickets[index].name = e.target.value;
                    setTicketTypes(newTickets);
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
                    const newTickets = [...ticketTypes];
                    newTickets[index].price = parseFloat(e.target.value);
                    setTicketTypes(newTickets);
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
                    const newTickets = [...ticketTypes];
                    newTickets[index].quantity = parseInt(e.target.value);
                    setTicketTypes(newTickets);
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

      <div className="flex justify-between items-center border-t border-white/10 pt-6">
        <button 
          type="button" 
          onClick={handleDelete}
          disabled={deleting || loading}
          className="btn text-red-400 border border-red-500/30 hover:bg-red-500/10 py-3 px-6"
        >
          {deleting ? "Deleting..." : "Delete Event"}
        </button>
        <button 
          type="submit" 
          disabled={loading || deleting}
          className="btn-primary py-3 px-8"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
