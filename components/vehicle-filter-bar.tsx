"use client";

import { useState } from "react";
import { X, IndianRupee, LayoutGrid, Fuel, Settings2, Users2, Bike } from "lucide-react";
import type { FilterState } from "@/types/filters";

/* ── Types ───────────────────────────────────────────────── */

export type FilterCategory = "cars" | "bikes" | "ev" | "commercial";

interface VehicleFilterBarProps {
  category:  FilterCategory;
  filters:   FilterState;
  onChange:  (f: FilterState) => void;
}

/* ── Budget ranges per category ─────────────────────────── */

const BUDGETS: Record<FilterCategory, { label: string; min: number; max: number }[]> = {
  cars: [
    { label: "Under ₹3L",   min: 0,  max: 3  },
    { label: "Under ₹5L",   min: 0,  max: 5  },
    { label: "₹5 – 8L",     min: 5,  max: 8  },
    { label: "₹8 – 12L",    min: 8,  max: 12 },
    { label: "₹12 – 20L",   min: 12, max: 20 },
    { label: "₹20 – 35L",   min: 20, max: 35 },
    { label: "₹35 – 50L",   min: 35, max: 50 },
    { label: "Luxury (50L+)",min: 50, max: 200},
  ],
  bikes: [
    { label: "Under ₹1L",   min: 0, max: 1  },
    { label: "₹1 – 1.5L",   min: 1, max: 1.5},
    { label: "₹1.5 – 2L",   min: 1.5,max:2  },
    { label: "₹2 – 3L",     min: 2, max: 3  },
    { label: "₹3 – 5L",     min: 3, max: 5  },
    { label: "Above ₹5L",   min: 5, max: 200},
  ],
  ev: [
    { label: "Under ₹5L",   min: 0,  max: 5  },
    { label: "₹5 – 10L",    min: 5,  max: 10 },
    { label: "₹10 – 20L",   min: 10, max: 20 },
    { label: "₹20 – 40L",   min: 20, max: 40 },
    { label: "₹40 – 60L",   min: 40, max: 60 },
    { label: "Above ₹60L",  min: 60, max: 200},
  ],
  commercial: [
    { label: "Under ₹5L",   min: 0,  max: 5  },
    { label: "₹5 – 10L",    min: 5,  max: 10 },
    { label: "₹10 – 20L",   min: 10, max: 20 },
    { label: "₹20 – 35L",   min: 20, max: 35 },
    { label: "Above ₹35L",  min: 35, max: 200},
  ],
};

/* ── Body types per category ─────────────────────────────── */

const BODY_TYPES: Record<FilterCategory, string[]> = {
  cars:       ["SUV", "Hatchback", "Sedan", "MUV", "Crossover", "Coupe", "Convertible", "Pickup", "Van", "Luxury"],
  bikes:      ["Sport", "Commuter", "Cruiser", "Adventure", "Scooter", "Electric", "Off-Road"],
  ev:         ["SUV", "Hatchback", "Sedan", "Crossover", "Scooter", "Bike"],
  commercial: ["Mini Truck", "Truck", "Bus", "Van", "Tipper", "Construction", "Pickup"],
};

/* ── Fuel types per category ─────────────────────────────── */

const FUEL_TYPES: Record<FilterCategory, string[]> = {
  cars:       ["Petrol", "Diesel", "CNG", "Electric", "Hybrid", "Mild Hybrid", "PHEV"],
  bikes:      ["Petrol", "Electric", "CNG"],
  ev:         ["Electric", "PHEV", "Hybrid"],
  commercial: ["Diesel", "Electric", "CNG", "Petrol"],
};

/* ── Transmission per category ───────────────────────────── */

const TRANSMISSIONS: Record<FilterCategory, string[]> = {
  cars:       ["Manual", "Automatic", "CVT", "AMT", "DCT", "IMT"],
  bikes:      ["Manual", "Automatic", "CVT"],
  ev:         ["Automatic", "Single Speed"],
  commercial: ["Manual", "Automatic", "AMT"],
};

/* ── Seating (cars only) ─────────────────────────────────── */

const SEATING = ["2 Seater", "4 Seater", "5 Seater", "6 Seater", "7 Seater", "8+ Seater"];

/* ── Tab configs per category ────────────────────────────── */

type TabKey = "budget" | "bodyType" | "fuelType" | "transmission" | "seating";

const TABS_FOR: Record<FilterCategory, { key: TabKey; label: string; Icon: React.ComponentType<{className?:string}> }[]> = {
  cars: [
    { key: "budget",       label: "Budget",          Icon: IndianRupee },
    { key: "bodyType",     label: "Body Type",       Icon: LayoutGrid  },
    { key: "fuelType",     label: "Fuel Type",       Icon: Fuel        },
    { key: "transmission", label: "Transmission",    Icon: Settings2   },
    { key: "seating",      label: "Seating Capacity",Icon: Users2      },
  ],
  bikes: [
    { key: "budget",       label: "Budget",          Icon: IndianRupee },
    { key: "bodyType",     label: "Bike Type",       Icon: Bike        },
    { key: "fuelType",     label: "Fuel Type",       Icon: Fuel        },
    { key: "transmission", label: "Transmission",    Icon: Settings2   },
  ],
  ev: [
    { key: "budget",       label: "Budget",          Icon: IndianRupee },
    { key: "bodyType",     label: "Body Type",       Icon: LayoutGrid  },
    { key: "fuelType",     label: "Fuel / Range",    Icon: Fuel        },
  ],
  commercial: [
    { key: "budget",       label: "Budget",          Icon: IndianRupee },
    { key: "bodyType",     label: "Vehicle Type",    Icon: LayoutGrid  },
    { key: "fuelType",     label: "Fuel Type",       Icon: Fuel        },
    { key: "transmission", label: "Transmission",    Icon: Settings2   },
  ],
};

/* ── Pill helpers ────────────────────────────────────────── */

function isBudgetActive(f: FilterState, min: number, max: number) {
  const [pMin, pMax] = f.priceRange ?? [0, 50];
  return pMin === min && pMax === max;
}

function toggleArr(arr: string[], val: string) {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

/* ── Component ───────────────────────────────────────────── */

export function VehicleFilterBar({ category, filters, onChange }: VehicleFilterBarProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("budget");
  const tabs = TABS_FOR[category];

  /* ── Count active filters ─────────────────────────── */
  const [pMin, pMax] = filters.priceRange ?? [0, 50];
  const budgetActive    = pMin > 0 || (pMax < 50 && pMax > 0);
  const bodyActive      = (filters.selectedBodyTypes?.length ?? 0) > 0;
  const fuelActive      = (filters.selectedFuelTypes?.length ?? 0) > 0;
  const transActive     = (filters.selectedTransmissions?.length ?? 0) > 0;
  const totalActive     = (budgetActive?1:0)+(bodyActive?1:0)+(fuelActive?1:0)+(transActive?1:0);

  function clearAll() {
    onChange({ ...filters, priceRange: [0, 50], selectedBodyTypes: [], selectedFuelTypes: [], selectedTransmissions: [] });
  }

  /* ── Render pills per active tab ──────────────────── */
  function renderPills() {
    if (activeTab === "budget") {
      return BUDGETS[category].map((b) => {
        const active = isBudgetActive(filters, b.min, b.max);
        return (
          <button
            key={b.label}
            onClick={() => onChange({ ...filters, priceRange: active ? [0, 50] : [b.min, b.max] })}
            className={`h-9 px-4 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap ${
              active
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-700 border-gray-200 hover:border-blue-400 hover:text-blue-700"
            }`}
          >
            {b.label}
          </button>
        );
      });
    }

    if (activeTab === "bodyType") {
      const selected = filters.selectedBodyTypes ?? [];
      return BODY_TYPES[category].map((bt) => {
        const active = selected.includes(bt);
        return (
          <button
            key={bt}
            onClick={() => onChange({ ...filters, selectedBodyTypes: toggleArr(selected, bt) })}
            className={`h-9 px-4 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap ${
              active
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-700 border-gray-200 hover:border-blue-400 hover:text-blue-700"
            }`}
          >
            {bt}
          </button>
        );
      });
    }

    if (activeTab === "fuelType") {
      const selected = filters.selectedFuelTypes ?? [];
      return FUEL_TYPES[category].map((ft) => {
        const active = selected.includes(ft);
        return (
          <button
            key={ft}
            onClick={() => onChange({ ...filters, selectedFuelTypes: toggleArr(selected, ft) })}
            className={`h-9 px-4 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap ${
              active
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-700 border-gray-200 hover:border-blue-400 hover:text-blue-700"
            }`}
          >
            {ft}
          </button>
        );
      });
    }

    if (activeTab === "transmission") {
      const selected = filters.selectedTransmissions ?? [];
      return TRANSMISSIONS[category].map((t) => {
        const active = selected.includes(t);
        return (
          <button
            key={t}
            onClick={() => onChange({ ...filters, selectedTransmissions: toggleArr(selected, t) })}
            className={`h-9 px-4 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap ${
              active
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-700 border-gray-200 hover:border-blue-400 hover:text-blue-700"
            }`}
          >
            {t}
          </button>
        );
      });
    }

    if (activeTab === "seating") {
      return SEATING.map((s) => (
        <button
          key={s}
          className="h-9 px-4 rounded-full text-sm font-medium border border-gray-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-all whitespace-nowrap"
        >
          {s}
        </button>
      ));
    }

    return null;
  }

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-5 pb-4">

        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Find {category === "cars" ? "The Cars" : category === "bikes" ? "Your Bike" : category === "ev" ? "Electric Vehicles" : "Commercial Vehicles"} of Your Choice
          </h2>
          {totalActive > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-bold transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear All ({totalActive})
            </button>
          )}
        </div>

        {/* Tab bar — underline style */}
        <div className="flex overflow-x-auto no-scrollbar border-b border-gray-100 mb-4">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            const hasDot =
              (tab.key === "budget" && budgetActive) ||
              (tab.key === "bodyType" && bodyActive) ||
              (tab.key === "fuelType" && fuelActive) ||
              (tab.key === "transmission" && transActive);

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold shrink-0 transition-colors whitespace-nowrap ${
                  isActive ? "text-blue-700" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <tab.Icon className="w-3.5 h-3.5" />
                {tab.label}
                {hasDot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-sm" />
                )}
              </button>
            );
          })}
        </div>

        {/* Pills */}
        <div className="flex flex-wrap gap-2">
          {renderPills()}
        </div>

        {/* Active filter chips summary */}
        {totalActive > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
            {budgetActive && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                {pMin === 0 ? `Under ₹${pMax}L` : pMax >= 200 ? `₹${pMin}L+` : `₹${pMin}L – ₹${pMax}L`}
                <button onClick={() => onChange({ ...filters, priceRange: [0, 50] })} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(filters.selectedBodyTypes ?? []).map((bt) => (
              <span key={bt} className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                {bt}
                <button onClick={() => onChange({ ...filters, selectedBodyTypes: filters.selectedBodyTypes!.filter((v) => v !== bt) })} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(filters.selectedFuelTypes ?? []).map((ft) => (
              <span key={ft} className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                {ft}
                <button onClick={() => onChange({ ...filters, selectedFuelTypes: filters.selectedFuelTypes!.filter((v) => v !== ft) })} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(filters.selectedTransmissions ?? []).map((t) => (
              <span key={t} className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                {t}
                <button onClick={() => onChange({ ...filters, selectedTransmissions: filters.selectedTransmissions!.filter((v) => v !== t) })} className="hover:text-blue-900">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
