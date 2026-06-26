"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CarGrid } from "@/components/car-grid";
import { VehicleFilterBar } from "@/components/vehicle-filter-bar";
import type { FilterState } from "@/types/filters";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import PageTopBanner from "@/components/home/PageTopBanner";

const BODY_QUICK = [
  { label: "SUV",       href: "/cars?bodyType=SUV"      },
  { label: "Hatchback", href: "/cars?bodyType=Hatchback" },
  { label: "Sedan",     href: "/cars?bodyType=Sedan"     },
  { label: "Electric",  href: "/ev"                      },
  { label: "Luxury",    href: "/cars?bodyType=Luxury"    },
];

export default function CarsPage() {
  const searchParams = useSearchParams();
  const searchQuery   = searchParams.get("search")   || "";
  const bodyTypeParam = searchParams.get("bodyType") || "";

  const [filters, setFilters] = useState<FilterState>({
    priceRange:           [0, 50],
    selectedBrands:       [],
    selectedFuelTypes:    [],
    selectedTransmissions:[],
    selectedBodyTypes:    bodyTypeParam ? [bodyTypeParam] : [],
    selectedSegments:     [],
    searchQuery,
  });

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      searchQuery,
      selectedBodyTypes: bodyTypeParam ? [bodyTypeParam] : prev.selectedBodyTypes,
    }));
  }, [searchQuery, bodyTypeParam]);

  return (
    <div className="min-h-screen bg-slate-50">
      <PageTopBanner position="cars_top" />

      {/* Hero strip */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-blue-200 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">New Cars</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-xl sm:text-2xl font-bold mb-1">New Cars in India</h1>
          <p className="text-blue-200 text-sm mb-5">
            Find your perfect car — filter by budget, fuel type, body style & more
          </p>

          {/* Quick body type filters */}
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/cars"
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                !bodyTypeParam
                  ? "bg-white text-blue-900 border-white"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
            >
              All Cars
            </Link>
            {BODY_QUICK.map((q) => (
              <Link
                key={q.label}
                href={q.href}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  bodyTypeParam === q.label
                    ? "bg-white text-blue-900 border-white"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
              >
                {q.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal filter bar */}
      <VehicleFilterBar
        category="cars"
        filters={filters}
        onChange={setFilters}
      />

      {/* Search result banner */}
      {searchQuery && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 font-medium">
            Showing results for "<span className="font-bold">{searchQuery}</span>"
          </div>
        </div>
      )}

      {/* Full-width grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <h2 className="font-bold text-slate-900 text-lg mb-4">
          {bodyTypeParam ? `${bodyTypeParam} Cars` : "All New Cars"}
        </h2>
        <CarGrid filters={filters} defaultType="CAR" />
      </div>
    </div>
  );
}
