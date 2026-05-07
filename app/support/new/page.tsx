"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { MessageSquare, AlertCircle } from "lucide-react";

export default function NewTicketPage() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "General",
    priority: "MEDIUM"
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create ticket");

      toast.success("Ticket created!", "We will get back to you shortly.");
      router.push(`/support/${json.data.id}`);
    } catch (err: any) {
      toast.error("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">How can we help?</h1>
      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select 
              className="input w-full"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="General">General Inquiry</option>
              <option value="Payment">Payment / Billing Issue</option>
              <option value="Technical">Technical Support</option>
              <option value="Event">Event Specific Question</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input 
              type="text" 
              required
              className="input w-full"
              placeholder="Briefly describe the issue"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea 
              required
              rows={6}
              className="input w-full resize-none"
              placeholder="Please provide as much detail as possible..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex gap-3">
            <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
            <p className="text-xs text-secondary leading-relaxed">
              For payment failures, please include your order number if available. Our team typically responds within 2-4 hours.
            </p>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 text-sm font-bold uppercase tracking-wider"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}
