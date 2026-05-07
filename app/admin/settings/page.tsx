"use client";
import { useState } from "react";
import { 
  Settings, Globe, Shield, CreditCard, 
  Mail, Bell, Lock, Database, 
  Cloud, Save, RotateCcw
} from "lucide-react";
import { toast } from "@/components/ui/toaster";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Settings saved", "Platform configuration has been updated.");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
          <p className="text-secondary">Configure global marketplace behavior and integrations.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-ghost py-2.5 px-6 text-sm gap-2 border border-white/10">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="btn-primary py-2.5 px-6 text-sm gap-2"
          >
            <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-1">
          <SettingTab icon={<Globe className="w-4 h-4" />} label="General" active />
          <SettingTab icon={<CreditCard className="w-4 h-4" />} label="Payments" />
          <SettingTab icon={<Mail className="w-4 h-4" />} label="Emails" />
          <SettingTab icon={<Shield className="w-4 h-4" />} label="Security" />
          <SettingTab icon={<Bell className="w-4 h-4" />} label="Notifications" />
          <SettingTab icon={<Database className="w-4 h-4" />} label="Advanced" />
        </div>

        <div className="lg:col-span-3 space-y-8">
          <section className="card p-8">
            <h3 className="text-lg font-bold mb-6">Marketplace Configuration</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted">Platform Fee (%)</label>
                  <input type="number" defaultValue="5" className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted">Base Currency</label>
                  <select className="input w-full">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-bold">Auto-approve Events</p>
                  <p className="text-xs text-muted">Automatically publish events from verified organizers.</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-indigo-500 relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>
          </section>

          <section className="card p-8">
            <h3 className="text-lg font-bold mb-6">Security & Authentication</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-bold">Maintenance Mode</p>
                  <p className="text-xs text-muted">Take the site offline for updates. Only admins can access.</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-white/10 relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-bold">Require 2FA for Organizers</p>
                  <p className="text-xs text-muted">Mandatory two-factor authentication for all organizer accounts.</p>
                </div>
                <div className="w-12 h-6 rounded-full bg-indigo-500 relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SettingTab({ icon, label, active = false }: any) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
      active 
        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
        : "text-secondary hover:bg-white/5 hover:text-white"
    }`}>
      {icon}
      {label}
    </button>
  );
}
