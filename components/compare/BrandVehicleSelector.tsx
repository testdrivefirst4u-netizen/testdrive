"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ChevronRight, Search, ArrowLeftRight, Check } from "lucide-react";

interface Brand { id: string; name: string; slug: string; logo: string | null; isPopular: boolean }
interface VehicleBasic {
  id: string; name: string; slug: string;
  priceDisplay: string | null; priceMin: number | null;
  images: Array<{ url: string }>;
  brand: { name: string; slug: string };
}

interface Props {
  compareBasePath: string;  // e.g. "/cars/compare"
  type?: string;            // e.g. "CAR"
  types?: string[];         // e.g. ["BIKE","SCOOTER"]
  maxSelect?: number;
}

export function BrandVehicleSelector({ compareBasePath, type, types, maxSelect = 4 }: Props) {
  const router = useRouter();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [vehicles, setVehicles] = useState<VehicleBasic[]>([]);
  const [selected, setSelected] = useState<VehicleBasic[]>([]);
  const [activeBrand, setActiveBrand] = useState<Brand | null>(null);
  const [brandSearch, setBrandSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const typeParam = types ? `types=${types.join(",")}` : type ? `type=${type}` : "";

  // Fetch brands
  useEffect(() => {
    fetch(`/api/brands?limit=100`)
      .then((r) => r.json())
      .then((d) => setBrands(d.brands || []))
      .catch(() => {})
      .finally(() => setLoadingBrands(false));
  }, []);

  // Fetch vehicles for selected brand
  useEffect(() => {
    if (!activeBrand) { setVehicles([]); return; }
    setLoadingVehicles(true);
    const params = new URLSearchParams({ brand: activeBrand.slug, limit: "60", sortBy: "popularity" });
    if (types) params.set("types", types.join(","));
    else if (type) params.set("type", type);
    fetch(`/api/vehicles?${params}`)
      .then((r) => r.json())
      .then((d) => setVehicles(d.vehicles || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoadingVehicles(false));
  }, [activeBrand, type, types]);

  function toggleVehicle(v: VehicleBasic) {
    if (selected.find((s) => s.id === v.id)) {
      setSelected((prev) => prev.filter((s) => s.id !== v.id));
    } else if (selected.length < maxSelect) {
      setSelected((prev) => [...prev, v]);
    }
  }

  function handleCompare() {
    if (selected.length < 2) return;
    const slug = selected.map((v) => v.slug).join("-vs-");
    router.push(`${compareBasePath}/${slug}`);
  }

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );
  const filteredVehicles = vehicles.filter((v) =>
    v.name.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Selected bar */}
      {selected.length > 0 && (
        <div className="border-b border-blue-100 px-4 py-3 bg-blue-50/60 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-blue-700 mr-1">Selected:</span>
          {selected.map((v, i) => (
            <div
              key={v.id}
              className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-full pl-1.5 pr-2 py-0.5 text-xs font-semibold text-slate-800"
            >
              {i > 0 && <span className="text-[9px] text-gray-400 -ml-0.5 mr-0.5">vs</span>}
              <div className="w-5 h-4 relative flex-shrink-0">
                <Image src={v.images[0]?.url || "/placeholder.svg"} alt={v.name} fill className="object-contain" sizes="20px" />
              </div>
              <span className="max-w-[80px] truncate">{v.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setSelected((p) => p.filter((s) => s.id !== v.id)); }}
                className="hover:text-red-500 text-gray-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {selected.length < maxSelect && (
              <span className="text-[10px] text-gray-400">{maxSelect - selected.length} more slot{maxSelect - selected.length !== 1 ? "s" : ""}</span>
            )}
            {selected.length >= 2 && (
              <button
                onClick={handleCompare}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors shadow-sm"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Compare Now
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex min-h-[380px]">
        {/* Brand panel */}
        <div className="w-52 flex-shrink-0 border-r border-gray-100 flex flex-col">
          <div className="px-3 py-3 border-b border-gray-100 bg-slate-50/50">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Select Brand</p>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
              <input
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brand…"
                className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {loadingBrands ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              filteredBrands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setActiveBrand(b); setVehicleSearch(""); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors border-l-2 ${
                    activeBrand?.id === b.id
                      ? "bg-blue-50 border-blue-600"
                      : "border-transparent hover:bg-slate-50 hover:border-gray-200"
                  }`}
                >
                  {b.logo ? (
                    <div className="w-7 h-7 relative flex-shrink-0 bg-white rounded-md border border-gray-100 shadow-sm p-0.5">
                      <Image src={b.logo} alt={b.name} fill className="object-contain" sizes="28px" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] font-bold text-slate-500">{b.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                  <span className={`text-xs font-medium truncate ${activeBrand?.id === b.id ? "text-blue-700" : "text-slate-700"}`}>
                    {b.name}
                  </span>
                  {activeBrand?.id === b.id && (
                    <ChevronRight className="w-3 h-3 text-blue-600 ml-auto flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Vehicle panel */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-4 py-3 border-b border-gray-100 bg-slate-50/50">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
              {activeBrand ? `${activeBrand.name} Models` : "Select a brand first"}
            </p>
            {activeBrand && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  placeholder="Search model…"
                  className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-400"
                />
              </div>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-3">
            {!activeBrand && (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <ArrowLeftRight className="w-8 h-8 mb-2 text-gray-200" />
                <p className="text-xs">Select a brand from the left panel</p>
              </div>
            )}

            {loadingVehicles && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {!loadingVehicles && activeBrand && filteredVehicles.length === 0 && (
              <div className="flex items-center justify-center h-40 text-xs text-gray-400">
                No models found for {activeBrand.name}
              </div>
            )}

            {!loadingVehicles && filteredVehicles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {filteredVehicles.map((v) => {
                  const isSelected = !!selected.find((s) => s.id === v.id);
                  const isDisabled = !isSelected && selected.length >= maxSelect;
                  return (
                    <button
                      key={v.id}
                      onClick={() => !isDisabled && toggleVehicle(v)}
                      disabled={isDisabled}
                      className={`relative p-2 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 shadow-sm"
                          : isDisabled
                          ? "border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed"
                          : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center z-10">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                      <div className="relative h-14 mb-1.5">
                        <Image
                          src={v.images[0]?.url || "/placeholder.svg"}
                          alt={v.name}
                          fill
                          className="object-contain"
                          sizes="120px"
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-800 leading-tight line-clamp-2">{v.name}</p>
                      <p className="text-[9px] text-blue-700 font-semibold mt-0.5">
                        {v.priceDisplay || (v.priceMin ? `₹${v.priceMin}L` : "TBD")}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      {selected.length === 0 && (
        <div className="px-4 py-2.5 bg-slate-50 border-t border-gray-100 text-center text-[10px] text-gray-400">
          Select 2–{maxSelect} vehicles to compare
        </div>
      )}
      {selected.length === 1 && (
        <div className="px-4 py-2.5 bg-blue-50 border-t border-blue-100 text-center text-[10px] text-blue-600 font-medium">
          Select 1 more vehicle to compare
        </div>
      )}
    </div>
  );
}
