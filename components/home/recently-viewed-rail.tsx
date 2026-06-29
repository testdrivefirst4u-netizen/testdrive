"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ChevronRight, X } from "lucide-react";
import { getRecentlyViewed, clearRecentlyViewed, type RecentlyViewedItem } from "@/lib/search-history";

function typeToPath(type: string) {
  if (type === "BIKE" || type === "SCOOTER") return "bikes";
  if (type === "EV") return "ev";
  if (type === "COMMERCIAL") return "commercial";
  return "cars";
}

export function RecentlyViewedRail() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(getRecentlyViewed());
  }, []);

  function handleClear(e: React.MouseEvent) {
    e.preventDefault();
    clearRecentlyViewed();
    setItems([]);
  }

  if (!mounted || items.length === 0) return null;

  return (
    <section className="py-6 bg-amber-50/60 border-y border-amber-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Continue Where You Left Off
            </h2>
          </div>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        </div>

        {/* Scrollable chips */}
        <div
          className="flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item) => {
            const href = `/${typeToPath(item.type)}/${item.brandSlug}/${item.slug}`;
            return (
              <Link
                key={item.id}
                href={href}
                className="flex items-center gap-3 bg-white rounded-2xl border border-amber-100 hover:border-amber-300 hover:shadow-md px-3.5 py-3 transition-all group flex-shrink-0 min-w-[210px]"
              >
                <div className="relative w-16 h-11 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="64px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-gray-400 font-medium truncate">
                    {item.brand}
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                    {item.name}
                  </p>
                  <p className="text-xs text-blue-700 font-semibold">{item.price}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
