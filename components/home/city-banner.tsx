"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronDown } from "lucide-react";

export function CityBanner() {
  const [city, setCity] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("walley_city");
      if (stored && stored.length > 1) setCity(stored);
    } catch {}
  }, []);

  if (!mounted || !city) return null;

  return (
    <div className="bg-blue-600 text-white text-center py-2 px-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-2 text-sm">
        <MapPin className="w-3.5 h-3.5 text-blue-200" />
        <span className="text-blue-100">Showing prices &amp; dealers near</span>
        <button
          onClick={() => {
            try { localStorage.removeItem("walley_city"); } catch {}
            setCity(null);
          }}
          className="flex items-center gap-1 font-bold text-white hover:text-blue-200 transition-colors"
        >
          {city}
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <span className="text-blue-300">·</span>
        <button
          onClick={() => {
            try { localStorage.removeItem("walley_city"); } catch {}
            setCity(null);
          }}
          className="text-blue-200 hover:text-white transition-colors text-xs underline underline-offset-2"
        >
          Change city
        </button>
      </div>
    </div>
  );
}
