"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight,
  Zap, Star,
  Droplets, Wind, Gauge, BatteryCharging, Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { FilterState } from "@/types/filters";

interface ApiVehicle {
  id: string; name: string; slug: string; type: string;
  priceMin: number | null; priceMax: number | null; priceDisplay: string | null;
  bodyType: string | null; isPopular: boolean; isElectric: boolean; featured: boolean;
  availabilityStatus: string;
  brand: { name: string; slug: string; logo: string | null };
  category: { name: string; slug: string };
  images: Array<{ url: string }>;
  variants: Array<{ fuelType: string | null; transmission: string | null; mileage: string | null; range: string | null; priceDisplay: string | null }>;
}

interface CarGridProps {
  filters: FilterState;
  defaultType?: string;
  defaultTypes?: string[];
  electricOnly?: boolean;
}

function typeToPath(type: string) {
  if (type === "BIKE" || type === "SCOOTER") return "bikes";
  if (type === "EV") return "ev";
  if (type === "COMMERCIAL") return "commercial";
  return "cars";
}

function FuelIcon({ fuelType }: { fuelType: string }) {
  const ft = fuelType.toLowerCase();
  if (ft.includes("electric") || ft === "ev") return <Zap className="w-3 h-3 text-teal-500" />;
  if (ft.includes("cng") || ft.includes("lpg")) return <Wind className="w-3 h-3 text-green-500" />;
  return <Droplets className="w-3 h-3 text-blue-400" />;
}

function VehicleCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 bg-gray-100 rounded" />
        <div className="h-5 w-3/4 bg-gray-100 rounded" />
        <div className="h-6 w-1/2 bg-gray-100 rounded" />
        <div className="flex gap-2 mt-3">
          <div className="h-8 flex-1 bg-gray-100 rounded" />
          <div className="h-8 flex-1 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export function CarGrid({ filters, defaultType, defaultTypes, electricOnly }: CarGridProps) {
  const [sortBy, setSortBy] = useState("newest");
  const [vehicles, setVehicles] = useState<ApiVehicle[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const LIMIT = 18;

  const fetchVehicles = useCallback(() => {
    const params = new URLSearchParams();
    if (filters.searchQuery) params.set("search", filters.searchQuery);
    if (filters.selectedBrands?.length) params.set("brand", filters.selectedBrands[0]);
    if (filters.selectedBodyTypes?.length) params.set("bodyType", filters.selectedBodyTypes.join(","));
    if (filters.selectedFuelTypes?.length) params.set("fuel", filters.selectedFuelTypes.join(","));
    if (filters.selectedTransmissions?.length) params.set("transmission", filters.selectedTransmissions.join(","));
    if (defaultTypes?.length) params.set("types", defaultTypes.join(","));
    else if (defaultType) params.set("type", defaultType);
    if (electricOnly) params.set("electric", "true");

    const [pMin, pMax] = filters.priceRange || [0, 200];
    if (pMin > 0) params.set("priceMin", String(pMin));
    if (pMax < 200) params.set("priceMax", String(pMax));

    params.set("sortBy", sortBy);
    params.set("limit", String(LIMIT));
    params.set("page", String(page));

    setLoading(true);
    setError(false);
    fetch(`/api/vehicles?${params}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => {
        setVehicles(d.vehicles || []);
        setTotal(d.total || 0);
        setTotalPages(d.pages || 1);
      })
      .catch(() => { setError(true); setVehicles([]); })
      .finally(() => setLoading(false));
  }, [filters, sortBy, page, defaultType, defaultTypes, electricOnly]);

  useEffect(() => {
    setPage(1);
  }, [filters, sortBy, defaultType]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 gap-3">
        <p className="text-sm text-gray-500">
          {loading ? "Loading…" : <><span className="font-semibold text-gray-900">{total}</span> vehicles found</>}
        </p>
        <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
          <SelectTrigger className="w-44 h-9 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="popularity">Most Popular</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="featured">Featured First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <VehicleCardSkeleton key={i} />)}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-gray-700 mb-2">Something went wrong</p>
          <p className="text-sm text-gray-400 mb-4">Could not load vehicles</p>
          <Button variant="outline" onClick={fetchVehicles}>Try again</Button>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-1">No vehicles found</p>
          <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {vehicles.map((v) => {
              const variant = v.variants[0];
              const img = v.images[0]?.url || "/placeholder.svg";
              const href = `/${typeToPath(v.type)}/${v.brand.slug}/${v.slug}`;
              const isEV = v.isElectric || v.type === "EV";

              return (
                <div
                  key={v.id}
                  className="group rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-50 overflow-hidden">
                    <Image
                      src={img} alt={v.name} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {v.featured && (
                        <Badge className="bg-amber-400 text-amber-900 border-0 text-xs">
                          <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />Featured
                        </Badge>
                      )}
                      {v.isPopular && !v.featured && (
                        <Badge className="bg-blue-600 text-white border-0 text-xs">Popular</Badge>
                      )}
                      {(v as any).isNew && (
                        <Badge className="bg-emerald-500 text-white border-0 text-xs">New</Badge>
                      )}
                      {isEV && (
                        <Badge className="bg-teal-500 text-white border-0 text-xs">
                          <Zap className="w-2.5 h-2.5 mr-0.5" />EV
                        </Badge>
                      )}
                    </div>
                    {v.availabilityStatus === "upcoming" && (
                      <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-white text-center text-xs py-1 font-medium">
                        Coming Soon
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-gray-400 mb-0.5 font-medium">{v.brand.name}</p>
                    <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-blue-700 transition-colors">
                      {v.name}
                    </h3>
                    <p className="text-lg font-bold text-blue-700 mb-3">
                      {v.priceDisplay || (v.priceMin ? `₹${v.priceMin} Lakh` : "Price on request")}
                    </p>

                    {/* Spec grid */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-gray-500 mb-4">
                      {variant?.fuelType && (
                        <div className="flex items-center gap-1.5">
                          <FuelIcon fuelType={variant.fuelType} />
                          <span>{variant.fuelType}</span>
                        </div>
                      )}
                      {variant?.transmission && (
                        <div className="flex items-center gap-1.5">
                          <Settings2 className="w-3 h-3 text-gray-400" />
                          <span>{variant.transmission}</span>
                        </div>
                      )}
                      {(variant?.mileage || variant?.range) && (
                        <div className="flex items-center gap-1.5 col-span-2">
                          {isEV
                            ? <BatteryCharging className="w-3 h-3 text-teal-500" />
                            : <Gauge className="w-3 h-3 text-gray-400" />}
                          <span>
                            {isEV
                              ? `Range: ${variant.range || "—"}`
                              : `Mileage: ${variant.mileage || "—"}`}
                          </span>
                        </div>
                      )}
                      {(v.bodyType || v.category?.name) && (
                        <span className="col-span-2 bg-slate-50 border border-gray-100 px-2 py-0.5 rounded-lg text-center text-gray-400">
                          {v.bodyType || v.category.name}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Link href={href} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full h-9 text-sm border-blue-100 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                        >
                          View Details
                        </Button>
                      </Link>
                      <Link href={`${href}#get-quote`} className="flex-1">
                        <Button className="w-full h-9 text-sm bg-blue-700 hover:bg-blue-800 text-white">
                          Get Quote
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number;
                if (totalPages <= 7) p = i + 1;
                else if (i === 0) p = 1;
                else if (i === 6) p = totalPages;
                else p = Math.min(Math.max(page - 2 + i, 2), totalPages - 1);
                return (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    className={`h-9 w-9 p-0 ${p === page ? "bg-blue-700 hover:bg-blue-800 border-blue-700 text-white" : ""}`}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
