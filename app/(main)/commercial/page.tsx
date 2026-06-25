"use client";

import { useState } from "react";
import { CarGrid } from "@/components/car-grid";
import { VehicleFilterBar } from "@/components/vehicle-filter-bar";
import type { FilterState } from "@/types/filters";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Truck, Package, Users, Wrench } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { icon: Truck,   label: "Trucks & LCVs", desc: "Light & medium commercial trucks",   href: "/commercial?bodyType=Truck"        },
  { icon: Package, label: "Mini Trucks",   desc: "Last-mile delivery vehicles",          href: "/commercial?bodyType=Mini+Truck"  },
  { icon: Users,   label: "Buses & Vans",  desc: "Passenger transport solutions",        href: "/commercial?bodyType=Bus"          },
  { icon: Wrench,  label: "Construction",  desc: "Heavy-duty work vehicles",             href: "/commercial?bodyType=Construction" },
];

export default function CommercialPage() {
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
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-purple-900 text-white py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-purple-200 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-purple-400" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Commercial Vehicles</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
              <Truck className="w-5 h-5 text-purple-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Commercial Vehicles</h1>
          </div>
          <p className="text-purple-100 text-sm">
            Trucks, mini-vans, buses & work vehicles for your business fleet
          </p>
        </div>
      </div>

      {/* Category cards */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.label}
                href={c.href}
                className="bg-white border border-gray-100 rounded-xl p-4 hover:border-purple-200 hover:shadow-md transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                  <Icon className="w-5 h-5 text-purple-700" />
                </div>
                <p className="font-semibold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                  {c.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Horizontal filter bar */}
      <VehicleFilterBar
        category="commercial"
        filters={filters}
        onChange={setFilters}
      />

      {/* Full-width grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 pb-12">
        <h2 className="font-bold text-slate-900 text-lg mb-4">Commercial Vehicles</h2>
        <CarGrid filters={filters} defaultType="COMMERCIAL" />
      </div>
    </div>
  );
}
