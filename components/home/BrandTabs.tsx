"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Car, Bike, PlugZap, Truck, TrendingUp } from "lucide-react";

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  count: number;
}

interface Props {
  cars:       BrandItem[];
  bikes:      BrandItem[];
  electric:   BrandItem[];
  commercial: BrandItem[];
}

const TABS = [
  {
    key:   "cars"       as const,
    label: "Cars",
    icon:  Car,
    href:  "/cars",
    activeBg:   "bg-blue-600 text-white shadow-lg shadow-blue-500/30",
    inactiveBg: "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
    dot:   "bg-blue-600",
    eyebrow: "New Car Brands",
    viewAll: "/cars",
  },
  {
    key:   "bikes"      as const,
    label: "Bikes",
    icon:  Bike,
    href:  "/bikes",
    activeBg:   "bg-orange-500 text-white shadow-lg shadow-orange-500/30",
    inactiveBg: "text-slate-600 hover:bg-orange-50 hover:text-orange-600",
    dot:   "bg-orange-500",
    eyebrow: "Two Wheeler Brands",
    viewAll: "/bikes",
  },
  {
    key:   "electric"   as const,
    label: "Electric",
    icon:  PlugZap,
    href:  "/ev",
    activeBg:   "bg-teal-600 text-white shadow-lg shadow-teal-500/30",
    inactiveBg: "text-slate-600 hover:bg-teal-50 hover:text-teal-600",
    dot:   "bg-teal-600",
    eyebrow: "EV Brands",
    viewAll: "/ev",
  },
  {
    key:   "commercial" as const,
    label: "Commercial",
    icon:  Truck,
    href:  "/commercial",
    activeBg:   "bg-purple-600 text-white shadow-lg shadow-purple-500/30",
    inactiveBg: "text-slate-600 hover:bg-purple-50 hover:text-purple-600",
    dot:   "bg-purple-600",
    eyebrow: "Commercial Brands",
    viewAll: "/commercial",
  },
] as const;

type TabKey = "cars" | "bikes" | "electric" | "commercial";

function BrandCard({
  brand,
  href,
  rank,
}: {
  brand: BrandItem;
  href: string;
  rank: number;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-3 pt-4 pb-3.5 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Trending badge — top 3 */}
      {rank < 3 && (
        <span className="absolute top-2 right-2 flex items-center gap-0.5 bg-amber-50 border border-amber-200 text-amber-600 text-[8px] font-black px-1.5 py-0.5 rounded-full leading-none">
          <TrendingUp className="w-2.5 h-2.5" />
        </span>
      )}

      {/* Logo */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 border border-gray-100 flex items-center justify-center overflow-hidden group-hover:border-blue-100 group-hover:bg-blue-50/40 transition-all duration-200 shadow-sm">
        {brand.logo ? (
          <Image
            src={brand.logo}
            alt={brand.name}
            width={48}
            height={48}
            className="object-contain group-hover:scale-110 transition-transform duration-200"
          />
        ) : (
          <span className="text-blue-700 font-extrabold text-xl group-hover:scale-110 transition-transform duration-200">
            {brand.name[0]}
          </span>
        )}
      </div>

      {/* Name + count */}
      <div className="text-center min-w-0">
        <p className="font-bold text-slate-800 text-xs group-hover:text-blue-700 transition-colors leading-tight truncate max-w-[80px]">
          {brand.name}
        </p>
        {brand.count > 0 && (
          <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
            {brand.count} model{brand.count !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </Link>
  );
}

export function BrandTabs({ cars, bikes, electric, commercial }: Props) {
  const [active, setActive] = useState<TabKey>("cars");

  const data: Record<TabKey, BrandItem[]> = { cars, bikes, electric, commercial };
  const tab = TABS.find((t) => t.key === active)!;
  const brands = data[active];

  return (
    <section className="py-10 sm:py-12 bg-white border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="section-eyebrow mb-1">{tab.eyebrow}</p>
            <h2 className="section-title">All {tab.label} Brands</h2>
          </div>
          <Link
            href={tab.viewAll}
            className="flex items-center gap-1 text-blue-700 font-semibold text-sm hover:gap-2 transition-all group self-start sm:self-auto"
          >
            View All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto no-scrollbar pb-0.5">
          {TABS.map((t) => {
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shrink-0 transition-all duration-200 ${
                  isActive ? t.activeBg : `bg-slate-50 border border-gray-100 ${t.inactiveBg}`
                }`}
              >
                <t.icon className={`w-4 h-4 ${isActive ? "text-white" : ""}`} />
                {t.label}
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-slate-500"
                }`}>
                  {data[t.key].length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Brand grid */}
        {brands.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <p className="text-sm font-medium">No {tab.label.toLowerCase()} brands yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
            {brands.map((brand, idx) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                href={`${tab.viewAll}?brand=${brand.slug}`}
                rank={idx}
              />
            ))}

            {/* View All card */}
            <Link
              href={tab.viewAll}
              className="flex flex-col items-center justify-center gap-2.5 bg-gradient-to-br from-blue-50 to-slate-100 border border-blue-100 hover:border-blue-300 rounded-2xl px-3 pt-4 pb-3.5 transition-all duration-200 hover:shadow-md group"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-200">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-blue-700 text-center leading-tight">
                View All
              </p>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
