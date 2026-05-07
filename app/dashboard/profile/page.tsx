"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { User, Mail, Shield, Camera, Bell, Lock, Smartphone, Globe } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Profile updated", "Your changes have been saved successfully.");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container py-12 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-secondary">Manage your personal information and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="flex flex-col gap-1">
            <TabButton icon={<User className="w-4 h-4" />} label="General" active />
            <TabButton icon={<Lock className="w-4 h-4" />} label="Security" />
            <TabButton icon={<Bell className="w-4 h-4" />} label="Notifications" />
            <TabButton icon={<Smartphone className="w-4 h-4" />} label="Connected Devices" />
            <TabButton icon={<Globe className="w-4 h-4" />} label="Privacy & Data" />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <div className="card p-8">
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/5">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-500/20">
                  {session?.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">{session?.user?.name}</h3>
                <p className="text-sm text-secondary mb-3">{session?.user?.email}</p>
                <div className="flex gap-2">
                  <span className="badge badge-brand text-[10px]">{session?.user?.role}</span>
                  <span className="badge text-[10px]" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>Verified Account</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                    <input 
                      type="text" 
                      className="input w-full pl-10" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-muted">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
                    <input 
                      type="email" 
                      disabled
                      className="input w-full pl-10 opacity-50 cursor-not-allowed" 
                      value={formData.email}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted">Bio / About Me</label>
                <textarea 
                  rows={3}
                  className="input w-full resize-none" 
                  placeholder="Tell us a bit about yourself..."
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary py-3 px-8"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Security Summary */}
          <div className="card p-8 border border-amber-500/10 bg-amber-500/5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Two-Factor Authentication</h3>
                <p className="text-sm text-secondary mb-4">Add an extra layer of security to your account by enabling 2FA. Recommended for all organizers.</p>
                <button className="text-xs font-bold uppercase tracking-widest text-amber-400 hover:underline">Setup 2FA Now →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      active 
        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
        : "text-secondary hover:bg-white/5 hover:text-white"
    }`}>
      {icon}
      {label}
    </button>
  );
}
