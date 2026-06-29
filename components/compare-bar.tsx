"use client";

import { useCompare } from "@/lib/compare-context";
import Image from "next/image";
import Link from "next/link";
import { X, GitCompare, ArrowRight, Plus } from "lucide-react";

function typeToPath(type: string) {
  if (type === "BIKE" || type === "SCOOTER") return "bikes";
  if (type === "EV") return "ev";
  if (type === "COMMERCIAL") return "commercial";
  return "cars";
}

export function CompareBar() {
  const { vehicles, remove, clear } = useCompare();

  if (vehicles.length === 0) return null;

  const basePath = typeToPath(vehicles[0].type);
  const compareUrl = `/${basePath}/compare/${vehicles
    .map((v) => `${v.brandSlug}/${v.slug}`)
    .join(",")}`;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-900 border-t border-white/10 shadow-2xl">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Label */}
            <div className="flex items-center gap-2 shrink-0">
              <GitCompare className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-bold text-white">
                Compare{" "}
                <span className="text-blue-400">({vehicles.length}/3)</span>
              </span>
            </div>

            {/* Vehicle chips */}
            <div className="flex items-center gap-2 flex-1 overflow-x-auto min-w-0">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-2.5 py-1.5 shrink-0 transition-colors"
                >
                  <div className="w-8 h-6 relative rounded-lg overflow-hidden bg-white/10 shrink-0">
                    <Image
                      src={v.image || "/placeholder.svg"}
                      alt={v.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate max-w-[90px]">
                      {v.name}
                    </p>
                    <p className="text-[10px] text-white/50 truncate max-w-[90px]">
                      {v.price}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(v.id)}
                    className="w-5 h-5 rounded-full hover:bg-red-500/30 flex items-center justify-center transition-colors shrink-0"
                  >
                    <X className="w-3 h-3 text-white/60 hover:text-white" />
                  </button>
                </div>
              ))}

              {/* Empty slot */}
              {vehicles.length < 3 && (
                <div className="flex items-center gap-2 border border-dashed border-white/20 rounded-xl px-3 py-1.5 shrink-0">
                  <Plus className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-xs text-white/30">Add vehicle</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                onClick={clear}
                className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1"
              >
                Clear all
              </button>
              {vehicles.length >= 2 && (
                <Link
                  href={compareUrl}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-blue-900/30"
                >
                  Compare Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
