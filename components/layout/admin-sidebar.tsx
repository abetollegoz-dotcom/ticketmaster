"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Globe, Ticket, Users, 
  Settings, ShieldAlert, BarChart3, LogOut,
  ChevronLeft, Menu, Bell
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";

const ADMIN_LINKS = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Manage Events", href: "/admin/events", icon: Globe },
  { label: "Payment Queue", href: "/admin/orders", icon: Ticket },
  { label: "Support Tickets", href: "/admin/support", icon: ShieldAlert },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Platform Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`flex flex-col h-screen border-r border-white/5 bg-[#080812] transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      {/* Brand */}
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">ADMIN PANEL</span>
          </Link>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-white/5 rounded-lg text-muted transition-colors"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {ADMIN_LINKS.map((link) => {
          const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                active 
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                  : "text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <link.icon className={`w-5 h-5 shrink-0 ${active ? "text-white" : "group-hover:text-indigo-400"}`} />
              {!collapsed && <span className="text-sm font-medium">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        {!collapsed && (
          <div className="p-4 bg-white/5 rounded-xl mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                SYS
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">System Status</p>
                <p className="text-xs font-semibold">Healthy</p>
              </div>
            </div>
          </div>
        )}
        <button 
          onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-xl"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium">Exit Admin</span>}
        </button>
      </div>
    </div>
  );
}
