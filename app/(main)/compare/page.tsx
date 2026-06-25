"use client";

import React, { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Plus, X, Search, ArrowLeftRight, Sparkles,
  Droplets, Wind, Zap, Settings2, Check, Minus,
  Car, Bike, Truck, Share2, Copy, Trophy,
  ChevronRight, Clock, IndianRupee,
} from "lucide-react";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SpecItem { name: string; unit: string | null; sortOrder: number }
interface SpecGroupMeta { name: string; slug: string; sortOrder: number }

interface FullVehicle {
  id: string; name: string; slug: string; type: string;
  priceMin: number | null; priceMax: number | null; priceDisplay: string | null;
  isElectric: boolean; pros: unknown; cons: unknown;
  brand: { name: string; slug: string; logo: string | null };
  images: Array<{ url: string }>;
  variants: Array<{
    id: string; name: string; priceDisplay: string | null;
    fuelType: string | null; transmission: string | null;
    mileage: string | null; range: string | null; isDefault: boolean;
  }>;
  specGroups: Array<{
    id: string; group: SpecGroupMeta;
    specValues: Array<{ value: string; specItem: SpecItem }>;
  }>;
  features: Array<{ id: string; category: string; name: string; available: boolean; sortOrder: number }>;
}

interface BasicVehicle {
  id: string; name: string; slug: string; type: string;
  priceDisplay: string | null; priceMin: number | null; isElectric: boolean;
  brand: { name: string; slug: string; logo: string | null };
  images: Array<{ url: string }>;
  variants: Array<{ fuelType: string | null; isDefault?: boolean }>;
}

const MAX = 3;

// ── Category tabs config ──────────────────────────────────────────────────────

type CategoryKey = "cars" | "bikes" | "commercial" | "electric";

const CATEGORY_TABS: {
  key: CategoryKey;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  apiParam: string;
  accentBg: string;
  accentText: string;
  activeBg: string;
}[] = [
  { key: "cars",       label: "Cars",             Icon: Car,   apiParam: "type=CAR",                accentBg: "bg-blue-50",   accentText: "text-blue-700",   activeBg: "bg-blue-600"   },
  { key: "bikes",      label: "Bikes & Scooters", Icon: Bike,  apiParam: "types=BIKE,SCOOTER",      accentBg: "bg-orange-50", accentText: "text-orange-700", activeBg: "bg-orange-500" },
  { key: "commercial", label: "Commercial",        Icon: Truck, apiParam: "type=COMMERCIAL",         accentBg: "bg-purple-50", accentText: "text-purple-700", activeBg: "bg-purple-600" },
  { key: "electric",   label: "Electric",          Icon: Zap,   apiParam: "electric=true",           accentBg: "bg-teal-50",   accentText: "text-teal-700",   activeBg: "bg-teal-600"   },
];

// ── Budget pills ──────────────────────────────────────────────────────────────

const BUDGET_PILLS = [
  { label: "All Budget",  min: 0,  max: 9999 },
  { label: "Under ₹5L",  min: 0,  max: 5    },
  { label: "₹5 – 10L",   min: 5,  max: 10   },
  { label: "₹10 – 20L",  min: 10, max: 20   },
  { label: "₹20 – 50L",  min: 20, max: 50   },
  { label: "₹50L+",      min: 50, max: 9999 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(v: { priceDisplay: string | null; priceMin: number | null; priceMax?: number | null }) {
  if (v.priceDisplay) return v.priceDisplay;
  if (v.priceMin && v.priceMax) return `₹${v.priceMin}–${v.priceMax} L`;
  if (v.priceMin) return `₹${v.priceMin} L*`;
  return "Price TBD";
}

function typeToPath(type: string) {
  const t = type?.toUpperCase();
  if (t === "BIKE" || t === "SCOOTER") return "bikes";
  if (t === "EV") return "ev";
  if (t === "COMMERCIAL") return "commercial";
  return "cars";
}

function FuelIcon({ fuel, cn = "w-3 h-3" }: { fuel: string; cn?: string }) {
  const ft = fuel.toLowerCase();
  if (ft.includes("electric")) return <Zap className={`${cn} text-teal-500`} />;
  if (ft.includes("cng") || ft.includes("lpg")) return <Wind className={`${cn} text-green-500`} />;
  return <Droplets className={`${cn} text-blue-400`} />;
}

function safeArr(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function parseNum(val: string): number | null {
  const m = val.replace(/,/g, "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

function getWinnerIdx(vals: string[], specName: string): number | null {
  if (vals.length < 2) return null;
  const nums = vals.map(parseNum);
  if (nums.some((n) => n === null)) return null;
  const n = specName.toLowerCase();
  const higherBetter = ["mileage", "range", "power", "torque", "speed", "capacity", "boot", "ground clearance", "horsepower", "kw"].some((k) => n.includes(k));
  const lowerBetter = ["price", "weight", "0-100", "0 to 100", "charging time", "emission"].some((k) => n.includes(k));
  if (!higherBetter && !lowerBetter) return null;
  const arr = nums as number[];
  if (arr.every((v) => v === arr[0])) return null;
  const best = higherBetter ? Math.max(...arr) : Math.min(...arr);
  return arr.findIndex((v) => v === best);
}

// ── Vehicle browse card ───────────────────────────────────────────────────────

function BrowseCard({
  vehicle, isSelected, isDisabled, onAdd, onRemove,
}: {
  vehicle: BasicVehicle;
  isSelected: boolean;
  isDisabled: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const img = vehicle.images[0]?.url || "/placeholder.svg";
  const fuel = vehicle.variants[0]?.fuelType;
  return (
    <div className={`relative bg-white border rounded-2xl overflow-hidden transition-all duration-200 group flex flex-col ${
      isSelected
        ? "border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-400"
        : isDisabled
        ? "border-gray-100 opacity-50 cursor-not-allowed"
        : "border-gray-100 hover:border-blue-200 hover:shadow-md cursor-pointer"
    }`}>
      {/* Image */}
      <div className="relative h-32 bg-slate-50 overflow-hidden flex-shrink-0">
        <Image src={img} alt={vehicle.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" sizes="200px" />
        {/* Selected badge */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <Check className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        {fuel && (
          <span className="absolute bottom-2 left-2 flex items-center gap-0.5 text-[9px] bg-white/90 backdrop-blur-sm border border-gray-100 px-1.5 py-0.5 rounded-full text-gray-500 font-medium">
            <FuelIcon fuel={fuel} cn="w-2.5 h-2.5" /> {fuel}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{vehicle.brand.name}</p>
        <p className="font-bold text-slate-900 text-xs leading-snug mb-1 line-clamp-2">{vehicle.name}</p>
        <p className="font-extrabold text-blue-700 text-sm mt-auto">{fmtPrice(vehicle)}</p>

        {/* Action button */}
        <button
          disabled={isDisabled && !isSelected}
          onClick={isSelected ? onRemove : onAdd}
          className={`mt-2 w-full h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            isSelected
              ? "bg-blue-50 text-blue-700 hover:bg-red-50 hover:text-red-600 border border-blue-200 hover:border-red-200"
              : isDisabled
              ? "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isSelected ? (
            <><X className="w-3.5 h-3.5" /> Remove</>
          ) : (
            <><Plus className="w-3.5 h-3.5" /> Add to Compare</>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Vehicle browse grid ───────────────────────────────────────────────────────

function BrowseGrid({
  category, budget, selectedIds, onAdd, onRemove,
}: {
  category: CategoryKey;
  budget: { min: number; max: number };
  selectedIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [vehicles, setVehicles] = useState<BasicVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 280);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch vehicles when category / budget / search changes
  useEffect(() => {
    const tab = CATEGORY_TABS.find((t) => t.key === category)!;
    const params = new URLSearchParams(tab.apiParam);
    params.set("limit", "24");
    params.set("sortBy", "popularity");
    if (budget.min > 0) params.set("priceMin", String(budget.min));
    if (budget.max < 9999) params.set("priceMax", String(budget.max));
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

    setLoading(true);
    fetch(`/api/vehicles?${params}`)
      .then((r) => r.json())
      .then((d) => setVehicles(d.vehicles || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [category, budget, debouncedSearch]);

  const skeletons = Array.from({ length: 8 });

  return (
    <div>
      {/* Search within category */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search in ${CATEGORY_TABS.find(t => t.key === category)?.label}…`}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-700" />
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {skeletons.map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-100" />
              <div className="p-3 space-y-2">
                <div className="h-2 w-12 bg-gray-100 rounded" />
                <div className="h-3 w-3/4 bg-gray-100 rounded" />
                <div className="h-4 w-1/2 bg-gray-100 rounded" />
                <div className="h-8 bg-gray-100 rounded-xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Car className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No vehicles found</p>
          {(search || budget.max < 9999) && (
            <p className="text-xs mt-1">Try adjusting your filters</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {vehicles.map((v) => (
            <BrowseCard
              key={v.id}
              vehicle={v}
              isSelected={selectedIds.includes(v.id)}
              isDisabled={selectedIds.length >= MAX && !selectedIds.includes(v.id)}
              onAdd={() => onAdd(v.slug)}
              onRemove={() => onRemove(v.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Compare slots bar ─────────────────────────────────────────────────────────

function CompareSlotsBar({
  selected, onRemove, onCompare, loading,
}: {
  selected: FullVehicle[];
  onRemove: (id: string) => void;
  onCompare: () => void;
  loading: boolean;
}) {
  const slots = Array.from({ length: MAX });
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-900 text-sm">Selected Vehicles</h2>
          <p className="text-[10px] text-gray-400 mt-0.5">{selected.length}/{MAX} vehicles selected • Click a vehicle below to add</p>
        </div>
        {selected.length >= 2 && (
          <button
            onClick={onCompare}
            className="flex items-center gap-2 h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Compare Now
          </button>
        )}
      </div>

      <div className="grid divide-x divide-gray-100" style={{ gridTemplateColumns: `repeat(${MAX}, 1fr)` }}>
        {slots.map((_, i) => {
          const v = selected[i];
          if (!v) {
            return (
              <div key={i} className="flex flex-col items-center justify-center py-5 px-3 gap-2 border-2 border-dashed border-blue-100 m-3 rounded-xl bg-blue-50/20">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs text-gray-400 font-medium text-center">Pick a vehicle from below</p>
              </div>
            );
          }
          const img = v.images[0]?.url || "/placeholder.svg";
          return (
            <div key={v.id} className="relative flex flex-col items-center text-center p-4">
              {/* Remove button */}
              <button
                onClick={() => onRemove(v.id)}
                className="absolute top-2 right-2 w-5 h-5 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-colors z-10"
              >
                <X className="w-2.5 h-2.5 text-gray-500" />
              </button>

              {/* VS badge between slots */}
              {i > 0 && (
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[8px] font-black shadow-md ring-2 ring-white z-20">
                  VS
                </div>
              )}

              <div className="relative h-20 w-full mb-2">
                <Image src={img} alt={v.name} fill className="object-contain" sizes="160px" />
              </div>
              <p className="text-[10px] text-gray-400 truncate w-full">{v.brand.name}</p>
              <p className="font-bold text-slate-900 text-xs truncate w-full">{v.name}</p>
              <p className="font-extrabold text-blue-700 text-sm">{fmtPrice(v)}</p>
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="px-5 py-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
          <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Loading vehicle details…
        </div>
      )}
    </div>
  );
}

// ── AI Summary ────────────────────────────────────────────────────────────────

function AISummary({ vehicles }: { vehicles: FullVehicle[] }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const key = vehicles.map((v) => v.id).join(",");

  useEffect(() => {
    if (vehicles.length < 2) { setSummary(null); return; }
    setSummary(null);
    setLoading(true);
    fetch("/api/compare/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicle1: `${vehicles[0].brand.name} ${vehicles[0].name}`,
        vehicle2: `${vehicles[1].brand.name} ${vehicles[1].name}`,
      }),
    })
      .then((r) => r.json())
      .then((d) => setSummary(d.result || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!loading && !summary) return null;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-blue-900 text-sm">AI Verdict</p>
          <p className="text-[10px] text-blue-500">Powered by AI · Expert Analysis</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-blue-200/70 rounded-full animate-pulse w-full" />
          <div className="h-3 bg-blue-200/70 rounded-full animate-pulse w-5/6" />
          <div className="h-3 bg-blue-200/70 rounded-full animate-pulse w-2/3" />
        </div>
      ) : (
        <p className="text-sm text-blue-900 leading-relaxed">{summary}</p>
      )}
    </div>
  );
}

// ── Share buttons ─────────────────────────────────────────────────────────────

function ShareBar({ vehicles }: { vehicles: FullVehicle[] }) {
  const [copied, setCopied] = useState(false);
  if (vehicles.length < 2) return null;
  const text = `Compare ${vehicles.map((v) => v.name).join(" vs ")} — specs, features & price`;
  const url  = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank")}
        className="flex items-center gap-1.5 text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-full px-3 py-1.5 font-semibold transition-colors"
      >
        <Share2 className="w-3 h-3" /> WhatsApp
      </button>
      <button
        onClick={() => { navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
        className="flex items-center gap-1.5 text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 border border-gray-200 rounded-full px-3 py-1.5 font-semibold transition-colors"
      >
        <Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}

// ── Spec table ────────────────────────────────────────────────────────────────

function SpecTable({ selected, activeGroup, highlightDiffs, hideCommon }: {
  selected: FullVehicle[]; activeGroup: string | null; highlightDiffs: boolean; hideCommon: boolean;
}) {
  const allGroups = Array.from(
    new Map(selected.flatMap((v) => v.specGroups.map((sg) => [sg.group.name, sg.group]))).values()
  ).sort((a, b) => a.sortOrder - b.sortOrder);
  const groups = activeGroup ? allGroups.filter((g) => g.name === activeGroup) : allGroups;

  function getValue(v: FullVehicle, groupName: string, itemName: string) {
    const sg = v.specGroups.find((sg) => sg.group.name === groupName);
    const sv = sg?.specValues.find((sv) => sv.specItem.name === itemName);
    if (!sv) return "—";
    return sv.specItem.unit ? `${sv.value} ${sv.specItem.unit}` : sv.value;
  }
  const COL = 168;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth: COL + selected.length * 140 }}>
        {groups.map((group) => {
          const itemsMap = new Map<string, SpecItem>();
          for (const v of selected) {
            const sg = v.specGroups.find((sg) => sg.group.name === group.name);
            for (const sv of sg?.specValues || []) itemsMap.set(sv.specItem.name, sv.specItem);
          }
          const items = Array.from(itemsMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
          const visible = items.filter((item) => {
            const vals = selected.map((v) => getValue(v, group.name, item.name));
            if (!vals.some((v) => v !== "—")) return false;
            if (hideCommon && vals.every((v) => v === vals[0]) && vals[0] !== "—") return false;
            return true;
          });
          if (!visible.length) return null;
          return (
            <tbody key={group.name}>
              <tr className="bg-blue-700">
                <td colSpan={1 + selected.length} className="py-2 px-5 text-[11px] font-bold text-white uppercase tracking-widest">{group.name}</td>
              </tr>
              {visible.map((item, rowIdx) => {
                const vals = selected.map((v) => getValue(v, group.name, item.name));
                const allSame = vals.every((v) => v === vals[0]);
                const winnerIdx = getWinnerIdx(vals, item.name);
                return (
                  <tr key={item.name} className={`border-b border-gray-100 transition-colors ${rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"} hover:bg-blue-50/30`}>
                    <td className="py-3 px-5 text-xs text-gray-500 font-medium align-middle" style={{ width: COL, minWidth: COL }}>{item.name}</td>
                    {vals.map((val, i) => (
                      <td key={i} className={`py-3 px-4 text-center text-xs font-semibold align-middle ${val === "—" ? "text-gray-300" : highlightDiffs && !allSame ? "text-amber-700 bg-amber-50" : "text-slate-800"}`}>
                        <div className="flex flex-col items-center gap-1">
                          <span>{val}</span>
                          {winnerIdx === i && val !== "—" && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">
                              <Trophy className="w-2 h-2" /> Best
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

// ── Pros & Cons ───────────────────────────────────────────────────────────────

function ProsConsSection({ selected }: { selected: FullVehicle[] }) {
  const [tab, setTab] = useState<"pros" | "cons">("pros");
  const hasPros = selected.some((v) => safeArr(v.pros).length > 0);
  const hasCons = selected.some((v) => safeArr(v.cons).length > 0);
  if (!hasPros && !hasCons) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
        <h3 className="font-bold text-slate-800 text-sm flex-1">Pros &amp; Cons</h3>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
          <button onClick={() => setTab("pros")} className={`px-3 py-1.5 font-semibold transition-colors ${tab === "pros" ? "bg-green-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>Pros</button>
          <button onClick={() => setTab("cons")} className={`px-3 py-1.5 font-semibold transition-colors ${tab === "cons" ? "bg-red-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}>Cons</button>
        </div>
      </div>
      <div className="grid divide-x divide-gray-100" style={{ gridTemplateColumns: `repeat(${selected.length}, 1fr)` }}>
        {selected.map((v) => {
          const items = safeArr(tab === "pros" ? v.pros : v.cons);
          return (
            <div key={v.id} className="p-4">
              <p className="font-bold text-xs text-slate-700 mb-3 truncate">{v.name}</p>
              {items.length === 0
                ? <p className="text-xs text-gray-400 italic">No data</p>
                : <ul className="space-y-2">{items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${tab === "pros" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                      {tab === "pros" ? <Check className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                    </span>
                    {item}
                  </li>
                ))}</ul>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function FeaturesSection({ selected }: { selected: FullVehicle[] }) {
  const catMap = new Map<string, Set<string>>();
  for (const v of selected)
    for (const f of v.features) {
      if (!catMap.has(f.category)) catMap.set(f.category, new Set());
      catMap.get(f.category)!.add(f.name);
    }
  if (!catMap.size) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h3 className="font-bold text-slate-800 text-sm">Features Comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50">
              <th className="text-left py-2.5 px-5 text-xs font-medium text-gray-400 w-44">Feature</th>
              {selected.map((v) => <th key={v.id} className="py-2.5 px-4 text-center text-xs font-bold text-slate-800">{v.name}</th>)}
            </tr>
          </thead>
          {Array.from(catMap.entries()).map(([cat, names]) => (
            <tbody key={cat}>
              <tr className="bg-blue-700 border-y">
                <td colSpan={1 + selected.length} className="py-2 px-5 text-[11px] font-bold text-white uppercase tracking-widest">{cat}</td>
              </tr>
              {Array.from(names).map((name, ri) => (
                <tr key={name} className={`border-b border-gray-50 hover:bg-blue-50/20 transition-colors ${ri % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                  <td className="py-2.5 px-5 text-xs text-gray-500 font-medium w-44">{name}</td>
                  {selected.map((v) => {
                    const f = v.features.find((f) => f.category === cat && f.name === name);
                    return (
                      <td key={v.id} className="py-2.5 px-4 text-center">
                        {f === undefined
                          ? <span className="text-gray-300 text-xs">—</span>
                          : f.available
                          ? <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 rounded-full"><Check className="w-3 h-3 text-green-600" /></span>
                          : <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full"><X className="w-3 h-3 text-gray-400" /></span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button role="checkbox" aria-checked={checked} onClick={onChange}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}>
        {checked && <Check className="w-2.5 h-2.5 text-white" />}
      </button>
      <span className="text-xs text-gray-700 font-medium">{label}</span>
    </label>
  );
}

// ── Recently Compared ─────────────────────────────────────────────────────────

const LS_KEY = "walley_recent_compares";

function RecentlyCompared() {
  const [recents, setRecents] = useState<Array<{ slugs: string[]; names: string[] }>>([]);
  useEffect(() => {
    try {
      const stored: Array<{ slugs: string[]; names: string[] }> = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      setRecents(stored.slice(0, 4));
    } catch {}
  }, []);
  if (!recents.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-gray-400" />
        <p className="font-bold text-slate-800 text-sm">Recently Compared</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {recents.map((r, i) => (
          <Link key={i} href={`/compare?vs=${r.slugs.join(",")}`}
            className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <p className="text-[11px] font-semibold text-slate-700 truncate group-hover:text-blue-700">{r.names.join(" vs ")}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function ComparePageInner() {
  const searchParams = useSearchParams();
  const vsParam = searchParams.get("vs");
  const router   = useRouter();

  const [selected,       setSelected]       = useState<FullVehicle[]>([]);
  const [loadingFetch,   setLoadingFetch]   = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("cars");
  const [activeBudget,   setActiveBudget]   = useState(BUDGET_PILLS[0]);
  const [counts,         setCounts]         = useState({ cars: 0, bikes: 0, commercial: 0, electric: 0 });
  const [highlightDiffs, setHighlightDiffs] = useState(false);
  const [hideCommon,     setHideCommon]     = useState(false);
  const [activeGroup,    setActiveGroup]    = useState<string | null>(null);
  const [showCompare,    setShowCompare]    = useState(false);
  const comparisonRef  = useRef<HTMLDivElement>(null);

  // Load counts once
  useEffect(() => {
    Promise.all([
      fetch("/api/vehicles?type=CAR&limit=1").then(r=>r.json()).then(d=>d.total||0).catch(()=>0),
      fetch("/api/vehicles?types=BIKE,SCOOTER&limit=1").then(r=>r.json()).then(d=>d.total||0).catch(()=>0),
      fetch("/api/vehicles?type=COMMERCIAL&limit=1").then(r=>r.json()).then(d=>d.total||0).catch(()=>0),
      fetch("/api/vehicles?electric=true&limit=1").then(r=>r.json()).then(d=>d.total||0).catch(()=>0),
    ]).then(([cars, bikes, commercial, electric]) => setCounts({ cars, bikes, commercial, electric }));
  }, []);

  // Load from URL ?vs=
  useEffect(() => {
    if (!vsParam) return;
    const urlSlugs = vsParam.split(",").filter(Boolean).slice(0, MAX);
    const currentSlugs = selected.map((v) => v.slug);
    if (urlSlugs.join(",") === currentSlugs.join(",")) return;
    setSelected([]);
    setLoadingFetch(true);
    Promise.all(
      urlSlugs.map(async (slug) => {
        try {
          const r = await fetch(`/api/vehicles/${slug.trim()}`);
          const d = await r.json();
          return (d.vehicle as FullVehicle) || null;
        } catch { return null; }
      })
    )
      .then((res) => { setSelected(res.filter((v): v is FullVehicle => !!v)); if (res.length >= 2) setShowCompare(true); })
      .finally(() => setLoadingFetch(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vsParam]);

  // Save to localStorage
  useEffect(() => {
    if (selected.length < 2) return;
    try {
      const entry = { slugs: selected.map((v) => v.slug), names: selected.map((v) => v.name) };
      const stored: typeof entry[] = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      const key = entry.slugs.join(",");
      const updated = [entry, ...stored.filter((r) => r.slugs.join(",") !== key)].slice(0, 4);
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.map((v) => v.id).join(",")]);

  function updateUrl(vehicles: FullVehicle[]) {
    if (vehicles.length > 0) {
      router.replace(`?vs=${vehicles.map((v) => v.slug).join(",")}`, { scroll: false });
    } else {
      router.replace("?", { scroll: false });
    }
  }

  async function addBySlug(slug: string) {
    if (selected.length >= MAX) return;
    setLoadingFetch(true);
    try {
      const r = await fetch(`/api/vehicles/${slug}`);
      const d = await r.json();
      if (d.vehicle) {
        const next = [...selected, d.vehicle as FullVehicle];
        setSelected(next);
        updateUrl(next);
      }
    } finally { setLoadingFetch(false); }
  }

  function removeById(id: string) {
    const next = selected.filter((v) => v.id !== id);
    setSelected(next);
    setShowCompare(false);
    setActiveGroup(null);
    updateUrl(next);
  }

  function clearAll() {
    setSelected([]);
    setShowCompare(false);
    setActiveGroup(null);
    router.replace("?", { scroll: false });
  }

  function handleCompare() {
    setShowCompare(true);
    setTimeout(() => comparisonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  const allGroups = Array.from(
    new Map(selected.flatMap((v) => v.specGroups.map((sg) => [sg.group.name, sg.group]))).values()
  ).sort((a, b) => a.sortOrder - b.sortOrder);

  const selectedIds = selected.map((v) => v.id);
  const hasComparison = selected.length >= 2 && showCompare;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white pt-6 pb-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-3">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-blue-200 hover:text-white text-xs">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-500" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white text-xs">Compare</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Compare Vehicles</h1>
              <p className="text-blue-200 text-sm mt-1">
                Pick up to {MAX} vehicles from Cars, Bikes, Commercial or Electric — compare specs, features & price side by side
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Compare slots bar ──────────────────────────────────────────── */}
        <CompareSlotsBar
          selected={selected}
          onRemove={removeById}
          onCompare={handleCompare}
          loading={loadingFetch}
        />

        {/* ── Vehicle browser ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Category tabs */}
          <div className="border-b border-gray-100">
            <div className="flex overflow-x-auto no-scrollbar">
              {CATEGORY_TABS.map((tab) => {
                const isActive = tab.key === activeCategory;
                const count = counts[tab.key];
                return (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveCategory(tab.key); setActiveBudget(BUDGET_PILLS[0]); }}
                    className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-semibold shrink-0 whitespace-nowrap transition-colors ${
                      isActive ? "text-blue-700" : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <tab.Icon className="w-4 h-4" />
                    {tab.label}
                    {count > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                        {count}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
                    )}
                  </button>
                );
              })}

              {/* Clear all at far right */}
              {selected.length > 0 && (
                <button
                  onClick={clearAll}
                  className="ml-auto mr-4 my-auto text-[10px] text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 rounded-full px-2.5 py-1 font-semibold transition-colors shrink-0"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Budget pills */}
          <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
            <IndianRupee className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            {BUDGET_PILLS.map((pill) => {
              const isActive = activeBudget.min === pill.min && activeBudget.max === pill.max;
              return (
                <button
                  key={pill.label}
                  onClick={() => setActiveBudget(pill)}
                  className={`h-7 px-3 rounded-full text-xs font-semibold border shrink-0 transition-all ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-gray-200 hover:border-blue-300 hover:text-blue-700"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Browse grid */}
          <div className="p-4 sm:p-5">
            <BrowseGrid
              category={activeCategory}
              budget={activeBudget}
              selectedIds={selectedIds}
              onAdd={addBySlug}
              onRemove={removeById}
            />
          </div>
        </div>

        {/* ── Recently compared ──────────────────────────────────────────── */}
        {selected.length === 0 && <RecentlyCompared />}

        {/* ── Comparison result (when Compare Now clicked) ───────────────── */}
        {hasComparison && (
          <div ref={comparisonRef} className="space-y-5 scroll-mt-20">

            {/* Comparison header */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Side-by-Side Comparison</p>
                <h2 className="text-lg font-extrabold text-slate-900">{selected.map((v) => v.name).join(" vs ")}</h2>
              </div>
              <ShareBar vehicles={selected} />
            </div>

            {/* AI Verdict */}
            <AISummary vehicles={selected} />

            {/* Controls bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              {allGroups.length > 0 && (
                <div className="flex overflow-x-auto border-b border-gray-100 no-scrollbar">
                  <button onClick={() => setActiveGroup(null)}
                    className={`flex-shrink-0 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${activeGroup === null ? "border-blue-600 text-blue-600 bg-blue-50/40" : "border-transparent text-gray-500 hover:text-slate-700"}`}>
                    All Specs
                  </button>
                  {allGroups.map((g) => (
                    <button key={g.name} onClick={() => setActiveGroup(g.name)}
                      className={`flex-shrink-0 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${activeGroup === g.name ? "border-blue-600 text-blue-600 bg-blue-50/40" : "border-transparent text-gray-500 hover:text-slate-700"}`}>
                      {g.name}
                    </button>
                  ))}
                </div>
              )}
              <div className="px-5 py-3 flex items-center gap-5 flex-wrap">
                <Toggle checked={hideCommon} onChange={() => setHideCommon((p) => !p)} label="Hide Common Specs" />
                <Toggle checked={highlightDiffs} onChange={() => setHighlightDiffs((p) => !p)} label="Highlight Differences" />
                <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-400">
                  <Trophy className="w-3 h-3 text-green-600" /> <span className="text-green-700 font-semibold">Best</span> = winner in that spec
                </span>
              </div>
            </div>

            {/* Sticky column header + spec table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="sticky top-16 z-20 bg-white border-b-2 border-blue-700 shadow-sm">
                <div className="grid" style={{ gridTemplateColumns: `168px repeat(${selected.length}, 1fr)` }}>
                  <div className="py-3 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Specification</div>
                  {selected.map((v) => (
                    <div key={v.id} className="py-3 px-3 text-center border-l border-gray-100">
                      <p className="text-[10px] text-gray-400 truncate">{v.brand.name}</p>
                      <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{v.name}</p>
                      <p className="text-xs text-blue-700 font-bold">{fmtPrice(v)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <SpecTable selected={selected} activeGroup={activeGroup} highlightDiffs={highlightDiffs} hideCommon={hideCommon} />
            </div>

            {/* Pros & Cons */}
            <ProsConsSection selected={selected} />

            {/* Features */}
            <FeaturesSection selected={selected} />

            {/* Nav links */}
            <div className="flex flex-wrap gap-2 pt-1">
              {selected.map((v) => (
                <Link key={v.id} href={`/${typeToPath(v.type)}/${v.brand.slug}/${v.slug}`}
                  className="text-xs bg-white border border-gray-200 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">
                  View {v.name} <ChevronRight className="w-3 h-3 inline" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Hint when < 2 selected ─────────────────────────────────────── */}
        {selected.length < 2 && !loadingFetch && (
          <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-blue-100">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ArrowLeftRight className="w-6 h-6 text-blue-600" />
            </div>
            <p className="font-semibold text-slate-700 text-sm mb-1">
              {selected.length === 0 ? "Add at least 2 vehicles to compare" : "Add 1 more vehicle to compare"}
            </p>
            <p className="text-xs text-gray-400">Click "+ Add to Compare" on any vehicle card above</p>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Page with Suspense ────────────────────────────────────────────────────────

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 h-28" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-4">
          <div className="h-36 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          <div className="h-64 bg-white rounded-2xl border border-gray-100 animate-pulse" />
        </div>
      </div>
    }>
      <ComparePageInner />
    </Suspense>
  );
}
