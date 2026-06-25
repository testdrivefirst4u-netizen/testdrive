"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

type Result = {
  id: string; name: string; slug: string; type: string;
  priceDisplay: string | null; priceMin: number | null;
  brand: { name: string; slug: string };
  images: Array<{ url: string }>;
};

function typeToPath(type: string) {
  if (type === "BIKE" || type === "SCOOTER") return "bikes";
  if (type === "EV") return "ev";
  if (type === "COMMERCIAL") return "commercial";
  return "cars";
}

function typeLabel(type: string) {
  if (type === "BIKE") return { label: "Bike", cls: "bg-orange-50 text-orange-600" };
  if (type === "SCOOTER") return { label: "Scooter", cls: "bg-orange-50 text-orange-600" };
  if (type === "EV") return { label: "EV", cls: "bg-teal-50 text-teal-600" };
  if (type === "COMMERCIAL") return { label: "Commercial", cls: "bg-purple-50 text-purple-600" };
  return { label: "Car", cls: "bg-blue-50 text-blue-600" };
}

export function SearchDropdown() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced live search against real API
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/vehicles?search=${encodeURIComponent(q)}&limit=8&sortBy=popularity`);
        const d = await r.json();
        setResults(d.vehicles || []);
        setOpen(true);
        setActiveIdx(-1);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function go(r: Result) {
    router.push(`/${typeToPath(r.type)}/${r.brand.slug}/${r.slug}`);
    setQuery("");
    setOpen(false);
    setActiveIdx(-1);
  }

  function handleSearch() {
    const q = query.trim();
    if (!q) return;
    if (activeIdx >= 0 && results[activeIdx]) { go(results[activeIdx]); return; }
    router.push(`/cars?search=${encodeURIComponent(q)}`);
    setQuery("");
    setOpen(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(p => Math.min(p + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(p => Math.max(p - 1, -1)); }
    else if (e.key === "Enter") { e.preventDefault(); handleSearch(); }
    else if (e.key === "Escape") { setOpen(false); setActiveIdx(-1); inputRef.current?.blur(); }
  }

  const showDropdown = open || loading;

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search cars, bikes, EVs…"
          className="pl-9 pr-8 h-10 text-sm border-gray-200 focus:border-blue-400"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden min-w-[320px]">
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center animate-pulse">
                  <div className="w-12 h-9 bg-gray-100 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="px-3 pt-2.5 pb-1 border-b border-gray-50">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
              </div>
              <ul className="py-1 max-h-80 overflow-y-auto">
                {results.map((r, i) => {
                  const tl = typeLabel(r.type);
                  return (
                    <li key={r.id}>
                      <button
                        onMouseEnter={() => setActiveIdx(i)}
                        onClick={() => go(r)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
                          i === activeIdx ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="w-12 h-9 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                          <Image
                            src={r.images[0]?.url || "/placeholder.svg"}
                            alt={r.name} fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{r.name}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {r.brand.name} · {r.priceDisplay || (r.priceMin ? `₹${r.priceMin} Lakh` : "Price TBD")}
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${tl.cls}`}>
                          {tl.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-gray-50 px-3 py-2">
                <button
                  onClick={handleSearch}
                  className="text-xs text-blue-700 font-semibold hover:underline"
                >
                  See all results for "{query}" →
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <Search className="w-6 h-6 text-gray-200 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-500">No results for "{query}"</p>
              <p className="text-xs text-gray-400 mt-0.5">Try a different name or brand</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
