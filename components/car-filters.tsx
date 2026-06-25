"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { FilterState } from "@/types/filters";

const BODY_TYPES = ["SUV", "Sedan", "Hatchback", "MUV", "Crossover", "Convertible", "Pickup", "Van"];
const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid", "Mild Hybrid"];
const TRANSMISSIONS = ["Manual", "Automatic", "CVT", "AMT", "DCT", "IMT"];

interface CarFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-sm font-semibold text-gray-800 hover:text-gray-900"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

const safeArr = (v: any): string[] => (Array.isArray(v) ? v : []);

export function CarFilters({ filters, setFilters }: CarFiltersProps) {
  const [brands, setBrands] = useState<Array<{ id: string; name: string; slug: string; _count: { vehicles: number } }>>([]);

  useEffect(() => {
    fetch("/api/brands?limit=100")
      .then((r) => r.json())
      .then((d) => setBrands(d.brands || []))
      .catch(() => setBrands([]));
  }, []);

  const selectedBrands = safeArr(filters.selectedBrands);
  const selectedFuelTypes = safeArr(filters.selectedFuelTypes);
  const selectedTransmissions = safeArr(filters.selectedTransmissions);
  const selectedBodyTypes = safeArr(filters.selectedBodyTypes);

  const toggle = (key: keyof FilterState, value: string, checked: boolean) => {
    const current = safeArr((filters as any)[key]);
    setFilters({ ...filters, [key]: checked ? [...current, value] : current.filter((v: string) => v !== value) });
  };

  const reset = () => setFilters({ priceRange: [0, 50], selectedBrands: [], selectedFuelTypes: [], selectedTransmissions: [], selectedBodyTypes: [], selectedSegments: [], searchQuery: filters.searchQuery });

  const activeCount = selectedBrands.length + selectedFuelTypes.length + selectedTransmissions.length + selectedBodyTypes.length +
    ((filters.priceRange?.[0] || 0) > 0 || (filters.priceRange?.[1] || 50) < 50 ? 1 : 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Filters</span>
          {activeCount > 0 && <Badge className="bg-blue-600 text-white text-xs h-5 px-1.5">{activeCount}</Badge>}
        </div>
        {activeCount > 0 && (
          <button onClick={reset} className="text-xs text-blue-700 hover:text-blue-800 flex items-center gap-1 font-medium">
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <div className="space-y-0">
        {/* Price */}
        <Section title="Budget (Lakh)">
          <Slider
            min={0} max={50} step={1}
            value={filters.priceRange || [0, 50]}
            onValueChange={(v) => setFilters({ ...filters, priceRange: v as [number, number] })}
            className="mt-3 mb-3"
          />
          <div className="flex justify-between text-xs font-semibold text-gray-700">
            <span className="bg-gray-100 px-2 py-1 rounded">₹{filters.priceRange?.[0] || 0}L</span>
            <span className="bg-gray-100 px-2 py-1 rounded">₹{filters.priceRange?.[1] || 50}L</span>
          </div>
        </Section>

        {/* Brands */}
        {brands.length > 0 && (
          <Section title="Brand">
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {brands.filter((b) => b._count.vehicles > 0).map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-2 group">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`brand-${b.slug}`}
                      checked={selectedBrands.includes(b.slug)}
                      onCheckedChange={(c) => toggle("selectedBrands", b.slug, !!c)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label htmlFor={`brand-${b.slug}`} className="text-sm cursor-pointer group-hover:text-blue-700 transition-colors">{b.name}</Label>
                  </div>
                  <span className="text-xs text-gray-400">{b._count.vehicles}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Body Type */}
        <Section title="Body Type">
          <div className="grid grid-cols-2 gap-1.5">
            {BODY_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => toggle("selectedBodyTypes", t, !selectedBodyTypes.includes(t))}
                className={`text-xs py-1.5 px-2 rounded-lg border transition-all ${
                  selectedBodyTypes.includes(t)
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                    : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>

        {/* Fuel */}
        <Section title="Fuel Type">
          <div className="grid grid-cols-2 gap-1.5">
            {FUEL_TYPES.map((f) => (
              <button
                key={f}
                onClick={() => toggle("selectedFuelTypes", f, !selectedFuelTypes.includes(f))}
                className={`text-xs py-1.5 px-2 rounded-lg border transition-all ${
                  selectedFuelTypes.includes(f)
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                    : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Section>

        {/* Transmission */}
        <Section title="Transmission" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-1.5">
            {TRANSMISSIONS.map((t) => (
              <button
                key={t}
                onClick={() => toggle("selectedTransmissions", t, !selectedTransmissions.includes(t))}
                className={`text-xs py-1.5 px-2 rounded-lg border transition-all ${
                  selectedTransmissions.includes(t)
                    ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                    : "border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
