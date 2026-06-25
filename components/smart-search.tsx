"use client";

import {
  useState, useEffect, useRef, useCallback,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search, X, Mic, MicOff, Clock, TrendingUp, Car,
  ChevronRight, Zap,
} from "lucide-react";
import {
  getRecentSearches, addRecentSearch, removeRecentSearch,
  clearRecentSearches, getRecentlyViewed, type RecentlyViewedItem,
} from "@/lib/search-history";

/* ── Types ──────────────────────────────────────────────── */

export type SearchCategory = "CAR" | "BIKE" | "EV" | "COMMERCIAL";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  type: string;
  priceDisplay: string | null;
  priceMin: number | null;
  brand: { name: string; slug: string };
  images: Array<{ url: string }>;
}

interface SmartSearchProps {
  category: SearchCategory;
  searchPath: string;
  placeholder?: string;
  trending: readonly string[];
  variant?: "hero" | "inline";
  onResultClick?: () => void;
}

/* ── Category → API params ─────────────────────────────── */

function buildCategoryParams(cat: SearchCategory): string {
  switch (cat) {
    case "CAR":        return "type=CAR";
    case "BIKE":       return "types=BIKE,SCOOTER";
    case "EV":         return "electric=true";
    case "COMMERCIAL": return "type=COMMERCIAL";
  }
}

function typeToPath(type: string) {
  if (type === "BIKE" || type === "SCOOTER") return "bikes";
  if (type === "EV") return "ev";
  if (type === "COMMERCIAL") return "commercial";
  return "cars";
}

function typeLabel(type: string) {
  if (type === "BIKE") return { text: "Bike", cls: "text-orange-600 bg-orange-50" };
  if (type === "SCOOTER") return { text: "Scooter", cls: "text-orange-600 bg-orange-50" };
  if (type === "EV") return { text: "EV", cls: "text-teal-600 bg-teal-50" };
  if (type === "COMMERCIAL") return { text: "Comm", cls: "text-purple-600 bg-purple-50" };
  return { text: "Car", cls: "text-blue-600 bg-blue-50" };
}

/* ── Voice search hook ─────────────────────────────────── */

function useVoiceSearch(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) return;
    setSupported(true);
    const rec = new SR();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const text: string = e.results?.[0]?.[0]?.transcript ?? "";
      if (text) onResult(text);
      setListening(false);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, [onResult]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setListening(true);
    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, supported, startListening, stopListening };
}

/* ── Main component ────────────────────────────────────── */

export function SmartSearch({
  category,
  searchPath,
  placeholder,
  trending,
  variant = "inline",
  onResultClick,
}: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Load recent searches + recently viewed on open */
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      setRecentlyViewed(getRecentlyViewed());
    }
  }, [open]);

  /* Category change → clear results */
  useEffect(() => {
    setQuery("");
    setResults([]);
    setOpen(false);
  }, [category]);

  /* Close on outside click */
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

  /* Debounced API search */
  const fetchResults = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (q.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const catParam = buildCategoryParams(category);
          const url = `/api/vehicles?search=${encodeURIComponent(q)}&${catParam}&limit=8&sortBy=popularity`;
          const r = await fetch(url);
          const d = await r.json();
          setResults(d.vehicles || []);
          setOpen(true);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 260);
    },
    [category],
  );

  function handleInput(val: string) {
    setQuery(val);
    setActiveIdx(-1);
    if (val.trim()) {
      fetchResults(val);
    } else {
      setResults([]);
      setLoading(false);
      setOpen(true); // show recent/trending
    }
  }

  function navigateTo(path: string, searchQuery?: string) {
    if (searchQuery) addRecentSearch(searchQuery);
    setQuery("");
    setResults([]);
    setOpen(false);
    setActiveIdx(-1);
    onResultClick?.();
    router.push(path);
  }

  function goToResult(r: SearchResult) {
    navigateTo(`/${typeToPath(r.type)}/${r.brand.slug}/${r.slug}`, r.name);
  }

  function handleSearch() {
    const q = query.trim();
    if (!q) return;
    if (activeIdx >= 0 && results[activeIdx]) {
      goToResult(results[activeIdx]);
      return;
    }
    navigateTo(`${searchPath}?search=${encodeURIComponent(q)}`, q);
  }

  function handleTrendingClick(term: string) {
    setQuery(term);
    fetchResults(term);
    addRecentSearch(term);
    setOpen(true);
  }

  function handleRecentClick(term: string) {
    setQuery(term);
    fetchResults(term);
    setOpen(true);
  }

  function removeRecent(e: React.MouseEvent, term: string) {
    e.stopPropagation();
    removeRecentSearch(term);
    setRecentSearches(getRecentSearches());
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((p) => Math.min(p + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((p) => Math.max(p - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
    }
  }

  const { listening, supported: voiceSupported, startListening, stopListening } = useVoiceSearch(
    useCallback((text: string) => {
      setQuery(text);
      fetchResults(text);
    }, [fetchResults])
  );

  const showDropdown = open || loading;
  const showResultsPane = query.trim().length >= 2;
  const ph = placeholder || `Search ${
    category === "CAR" ? "cars" :
    category === "BIKE" ? "bikes & scooters" :
    category === "EV" ? "electric vehicles" :
    "commercial vehicles"
  }…`;

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* ── Input row ──────────────────────────────────── */}
      <div className={`relative flex items-center gap-1 ${
        variant === "hero"
          ? "bg-white rounded-xl shadow-sm border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/15 transition-all"
          : "bg-white border border-gray-200 rounded-xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/10 transition-all"
      }`}>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setOpen(true)}
          placeholder={ph}
          autoComplete="off"
          className="flex-1 pl-10 pr-10 h-11 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none font-medium"
        />

        {/* Clear / Voice */}
        <div className="flex items-center gap-0.5 pr-2">
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setResults([]); setOpen(true); inputRef.current?.focus(); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {voiceSupported && (
            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              title={listening ? "Stop listening" : "Voice search"}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                listening
                  ? "bg-red-100 text-red-600 animate-pulse"
                  : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* ── Listening indicator ─────────────────────── */}
      {listening && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1 bg-red-500 rounded-full animate-bounce"
                style={{ height: `${12 + i * 4}px`, animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
          <p className="text-xs font-semibold text-red-600">Listening… speak now</p>
        </div>
      )}

      {/* ── Dropdown ──────────────────────────────────── */}
      {showDropdown && !listening && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden min-w-[300px]">

          {/* ── Results state ── */}
          {showResultsPane ? (
            loading ? (
              /* Skeleton */
              <div className="p-3 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
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
                <div className="px-3 pt-2.5 pb-1.5 border-b border-gray-50 flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </p>
                  <span className="text-[10px] text-blue-600 font-semibold">
                    {category === "BIKE" ? "Bikes Only" :
                     category === "EV" ? "EVs Only" :
                     category === "COMMERCIAL" ? "Commercial Only" : "Cars Only"}
                  </span>
                </div>
                <ul className="py-1 max-h-80 overflow-y-auto">
                  {results.map((r, i) => {
                    const tl = typeLabel(r.type);
                    const active = i === activeIdx;
                    return (
                      <li key={r.id}>
                        <button
                          onMouseEnter={() => setActiveIdx(i)}
                          onClick={() => goToResult(r)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            active ? "bg-blue-50" : "hover:bg-slate-50"
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
                            {tl.text}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-gray-50 px-3 py-2 bg-gray-50/50">
                  <button
                    onClick={handleSearch}
                    className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold hover:text-blue-800 transition-colors"
                  >
                    <Search className="w-3 h-3" />
                    See all results for "{query}"
                  </button>
                </div>
              </>
            ) : (
              /* No results */
              <div className="px-4 py-6 text-center">
                <Search className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600">No results for "{query}"</p>
                <p className="text-xs text-gray-400 mt-0.5">Try a different model name or brand</p>
              </div>
            )
          ) : (
            /* ── Empty state: recent + trending ── */
            <div className="py-2">

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="px-3 pb-2">
                  <div className="flex items-center justify-between mb-2 pt-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Recent Searches
                    </p>
                    <button
                      onClick={() => { clearRecentSearches(); setRecentSearches([]); }}
                      className="text-[10px] text-gray-400 hover:text-red-500 font-semibold transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="space-y-0.5">
                    {recentSearches.map((term) => (
                      <li key={term}>
                        <button
                          onClick={() => handleRecentClick(term)}
                          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-50 group text-left transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
                          <span className="text-sm text-slate-700 flex-1 truncate">{term}</span>
                          <button
                            onClick={(e) => removeRecent(e, term)}
                            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recently viewed */}
              {recentlyViewed.length > 0 && (
                <>
                  <div className="border-t border-gray-50 mx-3 mb-2" />
                  <div className="px-3 pb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pt-1 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Recently Viewed
                    </p>
                    <ul className="space-y-0.5">
                      {recentlyViewed.map((v) => (
                        <li key={v.id}>
                          <button
                            onClick={() => navigateTo(`/${typeToPath(v.type)}/${v.brandSlug}/${v.slug}`)}
                            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-slate-50 group text-left transition-colors"
                          >
                            {v.image ? (
                              <div className="w-10 h-7 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                                <Image src={v.image} alt={v.name} fill className="object-cover" sizes="40px" />
                              </div>
                            ) : (
                              <div className="w-10 h-7 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Car className="w-3.5 h-3.5 text-gray-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">{v.name}</p>
                              <p className="text-[10px] text-gray-400 truncate">{v.brand} · {v.price}</p>
                            </div>
                            <ChevronRight className="w-3 h-3 text-gray-200 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Divider */}
              {recentSearches.length > 0 && (
                <div className="border-t border-gray-50 mx-3 mb-2" />
              )}

              {/* Trending */}
              <div className="px-3 pb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 pt-1 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Trending
                </p>
                <ul className="space-y-0.5">
                  {trending.slice(0, 6).map((term, i) => (
                    <li key={term}>
                      <button
                        onClick={() => handleTrendingClick(term)}
                        className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-blue-50 group text-left transition-colors"
                      >
                        <span className="text-[10px] font-black text-gray-300 w-4 text-center">{i + 1}</span>
                        <TrendingUp className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        <span className="text-sm text-slate-700 group-hover:text-blue-700 flex-1 truncate transition-colors font-medium">
                          {term}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-blue-400 transition-colors" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Popular searches footer */}
              <div className="border-t border-gray-50 px-3 py-2 bg-gray-50/50">
                <p className="text-[10px] text-gray-400 font-medium">
                  <Zap className="w-3 h-3 inline mr-1 text-blue-400" />
                  Smart search — results filtered for{" "}
                  <span className="font-bold text-blue-600">
                    {category === "CAR" ? "Cars" : category === "BIKE" ? "Bikes" : category === "EV" ? "EVs" : "Commercial"}
                  </span>{" "}
                  only
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
