"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Calendar, Ticket, 
  DollarSign, Settings, LifeBuoy, 
  LogOut, ChevronLeft, Menu, UserCircle
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";

const ORGANIZER_LINKS = [
  { label: "Dashboard", href: "/organizer", icon: LayoutDashboard },
  { label: "My Events", href: "/organizer/events", icon: Calendar },
  { label: "Payouts", href: "/organizer/payouts", icon: DollarSign },
  { label: "Business Profile", href: "/organizer/settings", icon: UserCircle },
  { label: "Help & Support", href: "/support", icon: LifeBuoy },
];

export function OrganizerSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`flex flex-col h-screen border-r border-white/5 bg-[#0a0a1a] transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      {/* Brand */}
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight uppercase">Organizer Hub</span>
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
        {ORGANIZER_LINKS.map((link) => {
          const active = pathname === link.href || (link.href !== "/organizer" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                active 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <link.icon className={`w-5 h-5 shrink-0 ${active ? "text-white" : "group-hover:text-emerald-400"}`} />
              {!collapsed && <span className="text-sm font-medium">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-xl"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}
