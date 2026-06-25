"use client";

import Link from "next/link";
import {
  Car, Bike, PlugZap, Truck, ArrowLeftRight, Calculator,
  Star, Newspaper, MapPin, ShieldCheck, Phone, TrendingUp,
} from "lucide-react";

const CATEGORIES = [
  {
    icon: Car,
    label: "New Cars",
    sub: "500+ models",
    href: "/cars",
    gradient: "from-blue-600 to-blue-800",
    bg: "from-blue-50 to-blue-100/50",
    border: "border-blue-100 hover:border-blue-300",
    glow: "hover:shadow-blue-500/10",
    tag: null,
  },
  {
    icon: TrendingUp,
    label: "New Launches",
    sub: "Latest 2025–26",
    href: "/new-car-launches",
    gradient: "from-emerald-500 to-teal-700",
    bg: "from-emerald-50 to-teal-50",
    border: "border-emerald-100 hover:border-emerald-300",
    glow: "hover:shadow-emerald-500/10",
    tag: "NEW",
  },
  {
    icon: Bike,
    label: "Bikes",
    sub: "Two-wheelers",
    href: "/bikes",
    gradient: "from-orange-500 to-red-600",
    bg: "from-orange-50 to-red-50",
    border: "border-orange-100 hover:border-orange-300",
    glow: "hover:shadow-orange-500/10",
    tag: null,
  },
  {
    icon: PlugZap,
    label: "Electric",
    sub: "EVs & hybrids",
    href: "/ev",
    gradient: "from-teal-500 to-green-600",
    bg: "from-teal-50 to-green-50",
    border: "border-teal-100 hover:border-teal-300",
    glow: "hover:shadow-teal-500/10",
    tag: "HOT",
  },
  {
    icon: Truck,
    label: "Commercial",
    sub: "Fleet & business",
    href: "/commercial",
    gradient: "from-purple-600 to-indigo-700",
    bg: "from-purple-50 to-indigo-50",
    border: "border-purple-100 hover:border-purple-300",
    glow: "hover:shadow-purple-500/10",
    tag: null,
  },
  {
    icon: ArrowLeftRight,
    label: "Compare",
    sub: "Side-by-side specs",
    href: "/compare",
    gradient: "from-amber-500 to-orange-600",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-100 hover:border-amber-300",
    glow: "hover:shadow-amber-500/10",
    tag: null,
  },
  {
    icon: Calculator,
    label: "EMI",
    sub: "Plan your loan",
    href: "/emi-calculator",
    gradient: "from-blue-700 to-cyan-600",
    bg: "from-blue-50 to-cyan-50",
    border: "border-blue-100 hover:border-blue-300",
    glow: "hover:shadow-blue-600/10",
    tag: null,
  },
  {
    icon: Star,
    label: "Reviews",
    sub: "Expert road tests",
    href: "/reviews",
    gradient: "from-yellow-500 to-amber-600",
    bg: "from-yellow-50 to-amber-50",
    border: "border-yellow-100 hover:border-yellow-300",
    glow: "hover:shadow-yellow-500/10",
    tag: null,
  },
  {
    icon: Newspaper,
    label: "News",
    sub: "Latest auto news",
    href: "/news",
    gradient: "from-slate-600 to-slate-800",
    bg: "from-slate-50 to-gray-100",
    border: "border-slate-100 hover:border-slate-300",
    glow: "hover:shadow-slate-500/10",
    tag: null,
  },
  {
    icon: MapPin,
    label: "Dealers",
    sub: "Near you",
    href: "/dealers",
    gradient: "from-green-600 to-emerald-700",
    bg: "from-green-50 to-emerald-50",
    border: "border-green-100 hover:border-green-300",
    glow: "hover:shadow-green-500/10",
    tag: null,
  },
  {
    icon: ShieldCheck,
    label: "Insurance",
    sub: "Compare & save",
    href: "/insurance",
    gradient: "from-rose-500 to-pink-700",
    bg: "from-rose-50 to-pink-50",
    border: "border-rose-100 hover:border-rose-300",
    glow: "hover:shadow-rose-500/10",
    tag: null,
  },
  {
    icon: Phone,
    label: "Test Drive",
    sub: "Book at home",
    href: "/test-drive",
    gradient: "from-violet-600 to-purple-700",
    bg: "from-violet-50 to-purple-50",
    border: "border-violet-100 hover:border-violet-300",
    glow: "hover:shadow-violet-500/10",
    tag: "NEW",
  },
];

export function CategoryNav() {
  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="section-eyebrow mb-1">Explore</p>
            <h2 className="section-title">Browse by Category</h2>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.href}
                href={cat.href}
                className={`group relative flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-gradient-to-br ${cat.bg} border ${cat.border} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${cat.glow}`}
              >
                {cat.tag && (
                  <span className={`absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none ${
                    cat.tag === "HOT" ? "bg-red-500 text-white" : "bg-blue-600 text-white"
                  }`}>
                    {cat.tag}
                  </span>
                )}

                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cat.gradient} shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="text-center">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{cat.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight hidden sm:block">{cat.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
