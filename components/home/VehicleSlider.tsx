"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight,
  Zap, Star, Droplets, Wind, Gauge, BatteryCharging, Settings2,
  Heart, GitCompare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { isWishlisted, toggleWishlist } from "@/lib/wishlist";
import { useCompare } from "@/lib/compare-context";

export interface SliderVehicle {
  id: string;
  name: string;
  slug: string;
  type: string;
  priceMin: number | null;
  priceDisplay: string | null;
  isElectric: boolean;
  isPopular: boolean;
  isNew: boolean;
  isUpcoming: boolean;
  featured: boolean;
  availabilityStatus: string | null;
  bodyType: string | null;
  brand: { name: string; slug: string };
  images: Array<{ url: string }>;
  variants: Array<{
    fuelType: string | null;
    transmission: string | null;
    mileage: string | null;
    range: string | null;
  }>;
}

function typeToPath(type: string) {
  if (type === "BIKE" || type === "SCOOTER") return "bikes";
  if (type === "EV") return "ev";
  if (type === "COMMERCIAL") return "commercial";
  return "cars";
}

function FuelIcon({ fuelType }: { fuelType: string }) {
  const ft = fuelType.toLowerCase();
  if (ft.includes("electric") || ft === "ev") return <Zap className="w-2.5 h-2.5" />;
  if (ft.includes("cng") || ft.includes("lpg")) return <Wind className="w-2.5 h-2.5" />;
  return <Droplets className="w-2.5 h-2.5" />;
}

function VehicleCard({ v }: { v: SliderVehicle }) {
  const img       = v.images[0]?.url || "/placeholder.svg";
  const variant   = v.variants[0];
  const href      = `/${typeToPath(v.type)}/${v.brand.slug}/${v.slug}`;
  const isEV      = v.isElectric || v.type === "EV";
  const isUpcoming = v.availabilityStatus === "upcoming" || v.isUpcoming;
  const priceStr  = v.priceDisplay || (v.priceMin ? `₹${v.priceMin} Lakh` : "");

  const [wishlisted, setWishlisted] = useState(false);
  const { add, remove, has, canAdd } = useCompare();
  const inCompare = has(v.id);

  useEffect(() => {
    setWishlisted(isWishlisted(v.id));
  }, [v.id]);

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleWishlist({
      id: v.id, name: v.name, slug: v.slug,
      brand: v.brand.name, brandSlug: v.brand.slug,
      type: v.type, price: priceStr, image: img,
    });
    setWishlisted(next);
  }

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      remove(v.id);
    } else if (canAdd) {
      add({
        id: v.id, name: v.name, slug: v.slug,
        brand: v.brand.name, brandSlug: v.brand.slug,
        type: v.type, price: priceStr, image: img,
      });
    }
  }

  return (
    <div className="flex-shrink-0 w-[240px] sm:w-[260px] group">
      <Link
        href={href}
        className="block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      >
        {/* Image */}
        <div className="relative h-[148px] bg-gray-50 overflow-hidden">
          <Image
            src={img} alt={v.name} fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="260px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Badges — top left */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {v.featured && (
              <Badge className="bg-amber-400 text-amber-900 border-0 text-[10px] px-1.5 h-4">
                <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />Top Pick
              </Badge>
            )}
            {v.isPopular && !v.featured && (
              <Badge className="bg-blue-600 text-white border-0 text-[10px] px-1.5 h-4">Popular</Badge>
            )}
            {v.isNew && (
              <Badge className="bg-emerald-500 text-white border-0 text-[10px] px-1.5 h-4">New</Badge>
            )}
            {isEV && (
              <Badge className="bg-teal-500 text-white border-0 text-[10px] px-1.5 h-4">
                <Zap className="w-2.5 h-2.5 mr-0.5" />EV
              </Badge>
            )}
          </div>

          {/* Wishlist button — top right */}
          <button
            onClick={handleWishlist}
            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
              wishlisted
                ? "bg-red-500 hover:bg-red-600"
                : "bg-white/80 hover:bg-white hover:scale-110"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                wishlisted ? "text-white fill-white" : "text-gray-500"
              }`}
            />
          </button>

          {isUpcoming && (
            <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-white text-center text-[10px] py-0.5 font-semibold">
              Coming Soon
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-[11px] text-gray-400 mb-0.5 font-medium">{v.brand.name}</p>
          <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1 group-hover:text-blue-700 transition-colors line-clamp-1">
            {v.name}
          </h3>
          <p className="text-sm font-bold text-blue-700 mb-2.5">
            {priceStr || "Price TBD"}
          </p>

          {/* Spec pills */}
          <div className="flex gap-1 flex-wrap mb-2.5">
            {variant?.fuelType && (
              <span className="flex items-center gap-1 text-[10px] bg-slate-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                <FuelIcon fuelType={variant.fuelType} />
                {variant.fuelType}
              </span>
            )}
            {variant?.transmission && (
              <span className="flex items-center gap-1 text-[10px] bg-slate-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                <Settings2 className="w-2.5 h-2.5" />
                {variant.transmission}
              </span>
            )}
            {(variant?.mileage || variant?.range) && (
              <span className="flex items-center gap-1 text-[10px] bg-slate-50 border border-gray-100 px-2 py-0.5 rounded-full text-gray-500">
                {isEV
                  ? <BatteryCharging className="w-2.5 h-2.5" />
                  : <Gauge className="w-2.5 h-2.5" />}
                {isEV ? variant.range : variant.mileage}
              </span>
            )}
          </div>

          {/* Compare button */}
          <button
            onClick={handleCompare}
            className={`w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1.5 rounded-xl border transition-all duration-150 ${
              inCompare
                ? "bg-blue-600 text-white border-blue-600"
                : canAdd
                ? "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                : "border-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            <GitCompare className="w-3 h-3" />
            {inCompare ? "Added to Compare" : "Compare"}
          </button>
        </div>
      </Link>
    </div>
  );
}

export function VehicleSliderSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[240px] sm:w-[260px]">
          <div className="rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
            <div className="h-[148px] bg-gray-100" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-14 bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
              <div className="flex gap-1">
                <div className="h-4 w-16 bg-gray-100 rounded-full" />
                <div className="h-4 w-16 bg-gray-100 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function VehicleSlider({ vehicles }: { vehicles: SliderVehicle[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(vehicles.length > 4);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    updateArrows();
    return () => el.removeEventListener("scroll", updateArrows);
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -560 : 560, behavior: "smooth" });
  };

  if (vehicles.length === 0) return null;

  return (
    <div className="relative group/slider">
      {canLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-[60px] z-10 w-9 h-9 bg-white shadow-lg rounded-full border border-gray-100 flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-all opacity-0 group-hover/slider:opacity-100"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}
      {canRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-[60px] z-10 w-9 h-9 bg-white shadow-lg rounded-full border border-gray-100 flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-all opacity-0 group-hover/slider:opacity-100"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      )}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {vehicles.map((v) => (
          <VehicleCard key={v.id} v={v} />
        ))}
      </div>
    </div>
  );
}
