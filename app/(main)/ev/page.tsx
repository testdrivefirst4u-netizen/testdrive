"use client";

import { useState } from "react";
import { CarGrid } from "@/components/car-grid";
import { VehicleFilterBar } from "@/components/vehicle-filter-bar";
import type { FilterState } from "@/types/filters";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Zap, Battery, IndianRupee, Leaf } from "lucide-react";

const EV_HIGHLIGHTS = [
  { icon: Zap,        label: "Fast Charging",    desc: "DC fast charge in under 1 hr",    color: "text-teal-700 bg-teal-50"    },
  { icon: Battery,    label: "Long Range",        desc: "300+ km range on single charge",  color: "text-blue-700 bg-blue-50"    },
  { icon: IndianRupee,label: "Low Running Cost",  desc: "₹1–2 per km vs ₹6+ for petrol",  color: "text-emerald-700 bg-emerald-50"},
  { icon: Leaf,       label: "Zero Emissions",    desc: "No tailpipe, clean city air",     color: "text-green-700 bg-green-50"  },
];

export default function EvPage() {
  const [filters, setFilters] = useState<FilterState>({
    priceRange:           [0, 50],
    selectedBrands:       [],
    selectedFuelTypes:    [],
    selectedTransmissions:[],
    selectedBodyTypes:    [],
    selectedSegments:     [],
    searchQuery:          "",
  });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-950 via-blue-950 to-blue-900 text-white py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-teal-200 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-teal-400" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Electric Vehicles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-teal-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Electric Vehicles</h1>
          </div>
          <p className="text-teal-100 text-sm max-w-2xl">
            Future-proof your ride. Explore India's best electric cars, bikes & scooters — save fuel, reduce emissions, enjoy lower running costs.
          </p>
        </div>
      </div>

      {/* EV benefit cards */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {EV_HIGHLIGHTS.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.label} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${h.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm text-slate-900">{h.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{h.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Horizontal filter bar */}
      <VehicleFilterBar
        category="ev"
        filters={filters}
        onChange={setFilters}
      />

      {/* Full-width grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pb-12">
        <h2 className="font-bold text-slate-900 text-lg mb-4">All Electric Vehicles</h2>
        <CarGrid filters={filters} electricOnly />
      </div>
    </div>
  );
}
