"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IndianRupee, LayoutGrid, Fuel, Settings2, Users2,
} from "lucide-react";

/* ── Filter data ─────────────────────────────────────────── */

const TABS = [
  {
    key:   "budget",
    label: "Budget",
    Icon:  IndianRupee,
    pills: [
      { label: "Under ₹3 Lakh",  href: "/cars?priceMax=3"              },
      { label: "Under ₹5 Lakh",  href: "/cars?priceMax=5"              },
      { label: "Under ₹7 Lakh",  href: "/cars?priceMax=7"              },
      { label: "Under ₹8 Lakh",  href: "/cars?priceMax=8"              },
      { label: "Under ₹10 Lakh", href: "/cars?priceMax=10"             },
      { label: "Under ₹12 Lakh", href: "/cars?priceMax=12"             },
      { label: "Under ₹15 Lakh", href: "/cars?priceMax=15"             },
      { label: "Under ₹20 Lakh", href: "/cars?priceMax=20"             },
      { label: "Under ₹25 Lakh", href: "/cars?priceMax=25"             },
      { label: "Under ₹30 Lakh", href: "/cars?priceMax=30"             },
      { label: "₹30 – 50 Lakh",  href: "/cars?priceMin=30&priceMax=50" },
      { label: "Luxury Cars",    href: "/cars?priceMin=50"              },
    ],
  },
  {
    key:   "bodyType",
    label: "Body Type",
    Icon:  LayoutGrid,
    pills: [
      { label: "SUV",          href: "/cars?bodyType=SUV"          },
      { label: "Hatchback",    href: "/cars?bodyType=Hatchback"    },
      { label: "Sedan",        href: "/cars?bodyType=Sedan"        },
      { label: "MUV / MPV",   href: "/cars?bodyType=MUV"          },
      { label: "Crossover",    href: "/cars?bodyType=Crossover"    },
      { label: "Coupe",        href: "/cars?bodyType=Coupe"        },
      { label: "Convertible",  href: "/cars?bodyType=Convertible"  },
      { label: "Pickup Truck", href: "/cars?bodyType=Pickup"       },
      { label: "Van",          href: "/cars?bodyType=Van"          },
      { label: "Luxury",       href: "/cars?bodyType=Luxury"       },
    ],
  },
  {
    key:   "fuelType",
    label: "Fuel Type",
    Icon:  Fuel,
    pills: [
      { label: "Petrol",      href: "/cars?fuelType=Petrol"      },
      { label: "Diesel",      href: "/cars?fuelType=Diesel"      },
      { label: "Electric",    href: "/ev"                        },
      { label: "CNG",         href: "/cars?fuelType=CNG"         },
      { label: "Hybrid",      href: "/cars?fuelType=Hybrid"      },
      { label: "Mild Hybrid", href: "/cars?fuelType=Mild+Hybrid" },
      { label: "Plug-in Hybrid", href: "/cars?fuelType=PHEV"    },
      { label: "LPG",         href: "/cars?fuelType=LPG"         },
    ],
  },
  {
    key:   "transmission",
    label: "Transmission",
    Icon:  Settings2,
    pills: [
      { label: "Manual",    href: "/cars?transmission=Manual"    },
      { label: "Automatic", href: "/cars?transmission=Automatic" },
      { label: "CVT",       href: "/cars?transmission=CVT"       },
      { label: "AMT",       href: "/cars?transmission=AMT"       },
      { label: "DCT",       href: "/cars?transmission=DCT"       },
      { label: "IMT",       href: "/cars?transmission=IMT"       },
    ],
  },
  {
    key:   "seating",
    label: "Seating Capacity",
    Icon:  Users2,
    pills: [
      { label: "2 Seater",  href: "/cars?seats=2" },
      { label: "4 Seater",  href: "/cars?seats=4" },
      { label: "5 Seater",  href: "/cars?seats=5" },
      { label: "6 Seater",  href: "/cars?seats=6" },
      { label: "7 Seater",  href: "/cars?seats=7" },
      { label: "7+ Seater", href: "/cars?seats=8" },
    ],
  },
] as const;

type TabKey = typeof TABS[number]["key"];

/* ── Component ───────────────────────────────────────────── */

export function FindCarsFilter() {
  const [active, setActive] = useState<TabKey>("budget");
  const tab = TABS.find((t) => t.key === active)!;

  return (
    <section className="bg-white border-b border-gray-100 py-8 sm:py-10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5">
          Find The Cars Of Your Choice
        </h2>

        {/* Tab bar — underline style */}
        <div className="flex gap-0 overflow-x-auto no-scrollbar border-b border-gray-200 mb-5">
          {TABS.map((t) => {
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold shrink-0 transition-colors whitespace-nowrap ${
                  isActive
                    ? "text-blue-700"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <t.Icon className="w-3.5 h-3.5" />
                {t.label}
                {/* Active underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
                )}
              </button>
            );
          })}
        </div>

        {/* Pills */}
        <div className="flex flex-wrap gap-2">
          {tab.pills.map((pill) => (
            <Link
              key={pill.href}
              href={pill.href}
              className="inline-flex items-center h-9 px-4 rounded-full border border-gray-200 text-slate-700 text-sm font-medium hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all duration-150 bg-white shadow-sm whitespace-nowrap"
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
