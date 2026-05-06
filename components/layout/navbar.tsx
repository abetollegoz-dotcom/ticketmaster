"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useCartStore, useUIStore } from "@/store";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, ShoppingCart, Menu, X, Ticket, Bell, User,
  ChevronDown, LogOut, Settings, LayoutDashboard, Zap
} from "lucide-react";

const NAV_LINKS = [
  { label: "Events", href: "/events" },
  { label: "Venues", href: "/venues" },
  { label: "Categories", href: "/categories" },
  { label: "Trending", href: "/events?sort=trending" },
];

export function Navbar() {
  const { data: session } = useSession();
  const { items } = useCartStore();
  const { toggleSidebar } = useUIStore();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-dark shadow-lg" : "bg-transparent"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="container">
          <nav className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span
                style={{ fontFamily: "var(--font-display)" }}
                className="text-xl font-800 gradient-text hidden sm:block"
              >
                EventHub Pro
              </span>
            </Link>

            {/* Desktop nav */}
            <ul className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-indigo-400 transition-all"
                aria-label="Search events"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {/* Cart */}
              <motion.div whileHover={{ scale: 1.1 }}>
                <Link
                  href="/checkout/cart"
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-indigo-400 transition-all hover:bg-white/10"
                  aria-label={`Cart with ${cartCount} items`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0, y: 5 }}
                      animate={{ scale: 1, y: 0 }}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg border-2 border-[#080812]"
                    >
                      {cartCount > 9 ? "9+" : cartCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Auth */}
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass hover:bg-white/8 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {session.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 glass-dark border border-white/10 rounded-xl shadow-2xl py-2 z-50"
                        onMouseLeave={() => setUserMenuOpen(false)}
                      >
                        <div className="px-3 py-2 border-b border-white/8 mb-1">
                          <p className="text-sm font-semibold">{session.user?.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{session.user?.email}</p>
                        </div>
                        <UserMenuItem href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="My Dashboard" />
                        <UserMenuItem href="/dashboard/tickets" icon={<Ticket className="w-4 h-4" />} label="My Tickets" />
                        {(session.user?.role === "ORGANIZER" || session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN") && (
                          <UserMenuItem href="/organizer" icon={<Zap className="w-4 h-4" />} label="Organizer Portal" />
                        )}
                        {(session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN") && (
                          <UserMenuItem href="/admin" icon={<Settings className="w-4 h-4" />} label="Admin Panel" />
                        )}
                        <UserMenuItem href="/dashboard/profile" icon={<User className="w-4 h-4" />} label="Profile" />
                        <div className="border-t border-white/8 mt-1 pt-1">
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-lg mx-1"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login" className="btn-ghost text-sm py-2 px-4">
                    Sign In
                  </Link>
                  <Link href="/register" className="btn-primary text-sm py-2 px-4">
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-white/5 transition-all"
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>

          {/* Search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-4"
              >
                <form action="/search" className="relative">
                  <motion.div
                    animate={{ 
                      scale: searchOpen ? 1 : 0.95,
                      opacity: searchOpen ? 1 : 0
                    }}
                    className="relative"
                  >
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                    <input
                      autoFocus
                      name="q"
                      type="search"
                      placeholder="What are you looking for?"
                      className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-indigo-500/30 focus:border-indigo-500 bg-white/5 backdrop-blur-xl text-lg shadow-2xl transition-all outline-none"
                    />
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden glass-dark border-t border-white/8"
            >
              <div className="container py-4 flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                {!session && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/8">
                    <Link href="/login" className="btn-ghost text-sm py-2 flex-1 text-center">Sign In</Link>
                    <Link href="/register" className="btn-primary text-sm py-2 flex-1 text-center">Get Started</Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer */}
      <div className="h-16 md:h-20" />
    </>
  );
}

function UserMenuItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors rounded-lg mx-1"
    >
      {icon}
      {label}
    </Link>
  );
}
