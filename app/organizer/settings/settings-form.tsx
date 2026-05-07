"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import { Building2, Globe, Mail, Phone, Camera, Save, ShieldCheck } from "lucide-react";

export default function SettingsForm({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    organizationName: profile.organizationName || "",
    description: profile.description || "",
    website: profile.website || "",
    phone: profile.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/organizer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      toast.success("Profile updated successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error("Update failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <form onSubmit={handleSubmit} className="card p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-2xl font-bold text-emerald-400 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
                  {formData.organizationName?.[0]?.toUpperCase() || "O"}
                </div>
                <button type="button" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold mb-1 truncate">{formData.organizationName || "Your Organization"}</h3>
                <div className="flex gap-2">
                  <span className={`badge text-[10px] ${profile.isApproved ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {profile.isApproved ? "Verified Partner" : "Verification Pending"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-muted">Organization Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                  <input
                    type="text"
                    required
                    className="input w-full pl-10"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-muted">Business Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                  <input
                    type="tel"
                    className="input w-full pl-10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Official Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                <input
                  type="url"
                  className="input w-full pl-10"
                  placeholder="https://your-site.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-muted">Organization Description</label>
              <textarea
                rows={4}
                className="input w-full resize-none"
                placeholder="Briefly describe your organization..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary py-3 px-8 gap-2"
              >
                <Save className="w-4 h-4" /> {loading ? "Updating..." : "Save Business Profile"}
              </button>
            </div>
          </div>
        </form>

        <div className="card p-8 border border-emerald-500/10 bg-emerald-500/5">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Verification Status</h3>
              <p className="text-sm text-secondary mb-4 leading-relaxed">Your organization is currently awaiting manual verification by our trust and safety team. Once verified, your platform fee will be reduced by 1%.</p>
              <button className="text-xs font-bold uppercase tracking-widest text-emerald-400 hover:underline">Learn about our partner program →</button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="card p-6">
          <h3 className="font-bold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/2 border border-white/5">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Total Revenue</p>
              <p className="text-xl font-bold">${parseFloat(profile.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/2 border border-white/5">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Tickets Sold</p>
              <p className="text-xl font-bold">{profile.totalTicketsSold.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/2 border border-white/5">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Platform Fee</p>
              <p className="text-xl font-bold">5%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
