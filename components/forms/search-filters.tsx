"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface Category { id: string; name: string; slug: string; }
interface SearchFiltersBarProps {
  categories: Category[];
  currentFilters: Record<string, string | number | undefined>;
}

const SORT_OPTIONS = [
  { label: "Date (Earliest)", value: "date" },
  { label: "Trending", value: "trending" },
  { label: "Price (Low)", value: "price_asc" },
  { label: "Price (High)", value: "price_desc" },
];

export function SearchFiltersBar({ categories, currentFilters }: SearchFiltersBarProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);

  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    router.push(`/events?${params.toString()}`);
  };

  const clearAll = () => router.push("/events");

  const hasFilters = sp.get("category") || sp.get("city") || sp.get("sort") || sp.get("q");

  const FilterContent = () => (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            defaultValue={sp.get("q") || ""}
            placeholder="Event name..."
            className="pl-9 text-sm py-2"
            onKeyDown={e => { if (e.key === "Enter") applyFilter("q", (e.target as HTMLInputElement).value); }}
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Category</label>
        <div className="flex flex-col gap-1">
          <button onClick={() => applyFilter("category", "")} className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${!sp.get("category") ? "bg-indigo-500/20 text-indigo-400 font-semibold" : "hover:bg-white/5"}`}>All Categories</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => applyFilter("category", c.slug)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${sp.get("category") === c.slug ? "bg-indigo-500/20 text-indigo-400 font-semibold" : "hover:bg-white/5"}`} style={{ color: sp.get("category") === c.slug ? undefined : "var(--text-secondary)" }}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>City</label>
        <input type="text" defaultValue={sp.get("city") || ""} placeholder="e.g. New York" className="text-sm py-2"
          onKeyDown={e => { if (e.key === "Enter") applyFilter("city", (e.target as HTMLInputElement).value); }} />
      </div>

      {/* Sort */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Sort By</label>
        <select className="text-sm py-2" value={sp.get("sort") || "date"} onChange={e => applyFilter("sort", e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {hasFilters && (
        <button onClick={clearAll} className="btn-ghost text-sm py-2 gap-2 text-red-400 border-red-500/30">
          <X className="w-4 h-4" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button onClick={() => setOpen(!open)} className="btn-ghost text-sm py-2.5 gap-2 w-full">
          <SlidersHorizontal className="w-4 h-4" /> {open ? "Hide" : "Show"} Filters
        </button>
        {open && <div className="card p-5 mt-3"><FilterContent /></div>}
      </div>
      {/* Desktop sidebar */}
      <div className="hidden lg:block card p-5 sticky top-24"><FilterContent /></div>
    </>
  );
}
