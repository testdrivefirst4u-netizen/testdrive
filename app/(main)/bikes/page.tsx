"use client";

import { useState } from "react";
import { CarGrid } from "@/components/car-grid";
import { VehicleFilterBar } from "@/components/vehicle-filter-bar";
import type { FilterState } from "@/types/filters";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Bike, Zap, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";

const QUICK_FILTERS = [
  { label: "All Bikes",   types: ["BIKE", "SCOOTER"] },
  { label: "Bikes Only",  types: ["BIKE"]             },
  { label: "Scooters",    types: ["SCOOTER"]           },
];

const HIGHLIGHTS = [
  { icon: Bike,      label: "Commuter Bikes",       desc: "Best fuel efficiency for daily use", href: "/bikes?bodyType=Commuter" },
  { icon: Zap,       label: "Electric Two-Wheelers", desc: "Zero emission, low cost per km",    href: "/bikes?fuel=Electric"     },
  { icon: TrendingUp,label: "Sport Bikes",           desc: "Performance & style combined",      href: "/bikes?bodyType=Sport"    },
  { icon: Shield,    label: "Cruiser",               desc: "Long ride comfort & power",         href: "/bikes?bodyType=Cruiser"  },
];

export default function BikesPage() {
  const [filters, setFilters] = useState<FilterState>({
    priceRange:           [0, 50],
    selectedBrands:       [],
    selectedFuelTypes:    [],
    selectedTransmissions:[],
    selectedBodyTypes:    [],
    selectedSegments:     [],
    searchQuery:          "",
  });
  const [activeTypes, setActiveTypes] = useState<string[]>(["BIKE", "SCOOTER"]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-blue-200 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Bikes & Scooters</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Bikes & Scooters</h1>
          <p className="text-blue-200 text-sm mb-6">
            Explore{" "}
            {activeTypes.length > 1
              ? "bikes and scooters"
              : activeTypes[0]?.toLowerCase() + "s"}{" "}
            — commuter, cruiser, sport, electric & more
          </p>

          {/* Quick type tabs */}
          <div className="flex gap-2 flex-wrap">
            {QUICK_FILTERS.map((qf) => {
              const active =
                JSON.stringify(qf.types.sort()) ===
                JSON.stringify([...activeTypes].sort());
              return (
                <button
                  key={qf.label}
                  onClick={() => setActiveTypes(qf.types)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                    active
                      ? "bg-white text-blue-900 border-white"
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                >
                  {qf.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category highlights */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon;
            return (
              <Link
                key={h.label}
                href={h.href}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <Icon className="w-5 h-5 text-blue-700" />
                </div>
                <p className="font-semibold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                  {h.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{h.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Horizontal filter bar */}
      <VehicleFilterBar
        category="bikes"
        filters={filters}
        onChange={setFilters}
      />

      {/* Full-width grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pb-12">
        <h2 className="font-bold text-slate-900 text-lg mb-4">
          {activeTypes.includes("BIKE") && activeTypes.includes("SCOOTER")
            ? "All Bikes & Scooters"
            : activeTypes[0] === "BIKE"
            ? "Bikes"
            : "Scooters"}
        </h2>
        <CarGrid filters={filters} defaultTypes={activeTypes} />
      </div>
    </div>
  );
}
