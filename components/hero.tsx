"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SmartSearch, type SearchCategory } from "@/components/smart-search";
import {
  Car, Bike, PlugZap, Truck, ArrowRight, Sparkles,
  Shield, Users, Award, Zap, ChevronRight, Star, TrendingUp,
} from "lucide-react";

/* -- Banner slide config ----------------------------------- */

const SLIDES = [
  {
    cat: "CAR" as const,
    bg: "from-[#030d22] via-[#071638] to-[#040e27]",
    glow: "from-blue-700/30 via-blue-600/10 to-transparent",
    ring: "border-blue-500/10",
    accent: "text-blue-300/[0.07]",
    Icon: Car,
    stat: "500+ Car Models",
    dot: "bg-blue-500",
  },
  {
    cat: "BIKE" as const,
    bg: "from-[#1c0700] via-[#2f0f00] to-[#120400]",
    glow: "from-orange-700/30 via-orange-600/10 to-transparent",
    ring: "border-orange-500/10",
    accent: "text-orange-300/[0.07]",
    Icon: Bike,
    stat: "300+ Bike Models",
    dot: "bg-orange-500",
  },
  {
    cat: "EV" as const,
    bg: "from-[#001a0e] via-[#003318] to-[#00120a]",
    glow: "from-teal-700/30 via-teal-600/10 to-transparent",
    ring: "border-teal-500/10",
    accent: "text-teal-300/[0.07]",
    Icon: PlugZap,
    stat: "100+ EV Models",
    dot: "bg-teal-500",
  },
  {
    cat: "COMMERCIAL" as const,
    bg: "from-[#0b0320] via-[#160840] to-[#080218]",
    glow: "from-purple-700/30 via-purple-600/10 to-transparent",
    ring: "border-purple-500/10",
    accent: "text-purple-300/[0.07]",
    Icon: Truck,
    stat: "200+ Commercial Models",
    dot: "bg-purple-500",
  },
] as const;

/* -- Per-category data ------------------------------------- */

const CATEGORY_DATA = {
  CAR: {
    label: "Cars",
    path: "/cars",
    budgets: [
      { label: "Under Rs5L",  href: "/cars?priceMax=5"              },
      { label: "Rs5-10L",     href: "/cars?priceMin=5&priceMax=10"  },
      { label: "Rs10-20L",    href: "/cars?priceMin=10&priceMax=20" },
      { label: "Rs20-50L",    href: "/cars?priceMin=20&priceMax=50" },
      { label: "Above Rs50L", href: "/cars?priceMin=50"             },
    ],
    brands: [
      { label: "Maruti",   slug: "maruti-suzuki" },
      { label: "Tata",     slug: "tata"          },
      { label: "Hyundai",  slug: "hyundai"       },
      { label: "Mahindra", slug: "mahindra"      },
      { label: "Kia",      slug: "kia"           },
      { label: "Honda",    slug: "honda"         },
    ],
    trending: ["Tata Nexon", "Hyundai Creta", "Maruti Fronx", "Mahindra XUV 3XO", "Tata Punch"],
    quickLinks: [
      { label: "Upcoming Cars", href: "/cars?upcoming=true" },
      { label: "Latest Offers", href: "/offers"             },
      { label: "New Launches",  href: "/new-car-launches"   },
    ],
    placeholder: "Search Tata Nexon, Hyundai Creta...",
    headline: "Cars",
    sub: "Compare prices, specs & reviews across 500+ models",
  },
  BIKE: {
    label: "Bikes",
    path: "/bikes",
    budgets: [
      { label: "Under Rs1L", href: "/bikes?priceMax=1"             },
      { label: "Rs1-2L",     href: "/bikes?priceMin=1&priceMax=2"  },
      { label: "Rs2-3L",     href: "/bikes?priceMin=2&priceMax=3"  },
      { label: "Above Rs3L", href: "/bikes?priceMin=3"             },
    ],
    brands: [
      { label: "Hero",   slug: "hero"          },
      { label: "Honda",  slug: "honda"         },
      { label: "Yamaha", slug: "yamaha"        },
      { label: "TVS",    slug: "tvs"           },
      { label: "Bajaj",  slug: "bajaj"         },
      { label: "RE",     slug: "royal-enfield" },
    ],
    trending: ["Royal Enfield Hunter 350", "TVS Apache RTR 160", "Hero Xtreme 125R", "Bajaj Pulsar N160", "Yamaha R15 V4"],
    quickLinks: [
      { label: "Upcoming Bikes",    href: "/bikes?upcoming=true"    },
      { label: "Electric Scooters", href: "/bikes?bodyType=Scooter" },
      { label: "Latest Offers",     href: "/offers"                 },
    ],
    placeholder: "Search Royal Enfield, TVS Apache...",
    headline: "Bikes",
    sub: "Explore 300+ bikes & scooters - commuters to superbikes",
  },
  EV: {
    label: "Electric",
    path: "/ev",
    budgets: [
      { label: "Under Rs10L", href: "/ev?priceMax=10"             },
      { label: "Rs10-20L",    href: "/ev?priceMin=10&priceMax=20" },
      { label: "Rs20-40L",    href: "/ev?priceMin=20&priceMax=40" },
      { label: "Above Rs40L", href: "/ev?priceMin=40"             },
    ],
    brands: [
      { label: "Tata",     slug: "tata"         },
      { label: "MG",       slug: "mg"           },
      { label: "Mahindra", slug: "mahindra"     },
      { label: "Hyundai",  slug: "hyundai"      },
      { label: "Ola",      slug: "ola-electric" },
      { label: "Ather",    slug: "ather-energy" },
    ],
    trending: ["Tata Curvv EV", "Tata Nexon EV", "MG Windsor EV", "Mahindra BE 6", "Hyundai Creta Electric"],
    quickLinks: [
      { label: "Best Range EVs",  href: "/ev?sort=range"           },
      { label: "Budget EVs",      href: "/ev?priceMax=15"          },
      { label: "Fast Charging",   href: "/ev?filter=fast-charging" },
    ],
    placeholder: "Search Tata Nexon EV, MG Windsor...",
    headline: "Electric",
    sub: "Electric cars, bikes & scooters - 100+ models in India",
  },
  COMMERCIAL: {
    label: "Commercial",
    path: "/commercial",
    budgets: [
      { label: "Under Rs8L",  href: "/commercial?priceMax=8"               },
      { label: "Rs8-15L",     href: "/commercial?priceMin=8&priceMax=15"   },
      { label: "Rs15-25L",    href: "/commercial?priceMin=15&priceMax=25"  },
      { label: "Above Rs25L", href: "/commercial?priceMin=25"              },
    ],
    brands: [
      { label: "Tata",         slug: "tata"          },
      { label: "Mahindra",     slug: "mahindra"      },
      { label: "Ashok Leyland",slug: "ashok-leyland" },
      { label: "Eicher",       slug: "eicher"        },
    ],
    trending: ["Ashok Leyland Dost", "Tata Ace EV", "Mahindra Bolero Pickup", "Eicher Pro Series", "Ashok Leyland Partner"],
    quickLinks: [
      { label: "Mini Trucks",    href: "/commercial?bodyType=Mini+Truck" },
      { label: "Pickups",        href: "/commercial?bodyType=Pickup"      },
      { label: "Cargo Vehicles", href: "/commercial?bodyType=Cargo"       },
    ],
    placeholder: "Search Tata Ace, Eicher trucks...",
    headline: "Commercial",
    sub: "Mini trucks, pickups & cargo vehicles for every business",
  },
} as const;

const TABS = [
  { key: "CAR"        as const, label: "Cars",       Icon: Car,     activeRing: "ring-blue-500/40"   },
  { key: "BIKE"       as const, label: "Bikes",      Icon: Bike,    activeRing: "ring-orange-500/40" },
  { key: "EV"         as const, label: "Electric",   Icon: PlugZap, activeRing: "ring-teal-500/40"   },
  { key: "COMMERCIAL" as const, label: "Commercial", Icon: Truck,   activeRing: "ring-purple-500/40" },
];

const STATS = [
  { Icon: Car,    value: "500+", label: "Models"  },
  { Icon: Award,  value: "50+",  label: "Brands"  },
  { Icon: Users,  value: "1M+",  label: "Users"   },
  { Icon: Shield, value: "500+", label: "Dealers" },
];

const HEADLINE_MAIN: Record<SearchCategory, string> = {
  CAR:        "Find Your Perfect",
  BIKE:       "Your Perfect Ride",
  EV:         "Drive Green Zero",
  COMMERCIAL: "Your Business Fleet",
};

const HEADLINE_ACCENT: Record<SearchCategory, string> = {
  CAR:        "Car",
  BIKE:       "Awaits",
  EV:         "Emission",
  COMMERCIAL: "Partner",
};

/* -- Main Component ---------------------------------------- */

export function Hero() {
  const [activeIdx, setActiveIdx]       = useState(0);
  const [activeCategory, setActiveCat] = useState<SearchCategory>("CAR");
  const [isPaused, setIsPaused]        = useState(false);
  const intervalRef                     = useRef<ReturnType<typeof setInterval> | null>(null);
  const router                          = useRouter();

  const data = CATEGORY_DATA[activeCategory];

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIdx((prev) => {
        const next = (prev + 1) % SLIDES.length;
        setActiveCat(SLIDES[next].cat);
        return next;
      });
    }, 5000);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      startInterval();
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, startInterval]);

  function goTo(idx: number) {
    setActiveIdx(idx);
    setActiveCat(SLIDES[idx].cat);
    startInterval();
  }

  function selectCategory(cat: SearchCategory) {
    const idx = SLIDES.findIndex((s) => s.cat === cat);
    goTo(idx);
  }

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background slides */}
      <div className="absolute inset-0" aria-hidden>
        {SLIDES.map((slide, i) => {
          const BgIcon = slide.Icon;
          return (
            <div
              key={slide.cat}
              className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-opacity duration-1000 ease-in-out ${
                i === activeIdx ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute inset-0 bg-grid" />
              <div className={`absolute -top-40 left-[15%] w-[700px] h-[700px] bg-gradient-to-b ${slide.glow} rounded-full blur-3xl`} />
              <div className={`absolute bottom-0 right-0 w-[500px] h-[400px] bg-gradient-to-tl ${slide.glow} rounded-full blur-3xl translate-y-1/3`} />
              <div className={`absolute right-[4%] top-1/2 -translate-y-1/2 w-[480px] h-[480px] border ${slide.ring} rounded-full hidden xl:block`} />
              <div className={`absolute right-[4%] top-1/2 -translate-y-1/2 w-[340px] h-[340px] border ${slide.ring} rounded-full hidden xl:block`} />
              <div className={`absolute right-[4%] top-1/2 -translate-y-1/2 w-[210px] h-[210px] border ${slide.ring} rounded-full hidden xl:block`} />
              <BgIcon className={`absolute right-[3%] top-1/2 -translate-y-1/2 w-72 h-72 xl:w-96 xl:h-96 ${slide.accent} hidden lg:block`} />
              <div className="absolute top-10 right-[18%] hidden lg:grid grid-cols-5 gap-3 opacity-10">
                {Array.from({ length: 20 }).map((_, di) => (
                  <div key={di} className="w-1 h-1 rounded-full bg-white" />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Announcement bar */}
      <div className="relative z-10 bg-blue-700/70 backdrop-blur-sm border-b border-blue-500/20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-9 flex items-center justify-center gap-3">
          <Sparkles className="w-3.5 h-3.5 text-blue-200 shrink-0" />
          <p className="text-xs text-blue-100 font-medium truncate">
            <span className="font-bold text-white">New 2026 Models</span>{" "}
            are live &mdash; Compare prices &amp; book test drives
          </p>
          <Link
            href="/new-car-launches"
            className="hidden sm:flex items-center gap-1 text-xs text-blue-200 hover:text-white font-bold whitespace-nowrap transition-colors shrink-0"
          >
            Explore <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24">
        <div className="grid lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px] gap-8 xl:gap-14 items-center">

          {/* Left column */}
          <div className="space-y-4 sm:space-y-5">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-white/[0.07] border border-white/10 text-white/65 rounded-full px-3.5 py-1.5 text-[11px] font-semibold">
              <Zap className="w-3 h-3 fill-blue-400 text-blue-400 shrink-0" />
              India&apos;s Most Trusted Auto Platform &middot; 2026
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-[2rem] sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-extrabold text-white leading-[1.08] tracking-tight">
                {HEADLINE_MAIN[activeCategory]}{" "}
                <span className="text-gradient-blue">{HEADLINE_ACCENT[activeCategory]}</span>
              </h1>
              <p className="mt-2 text-sm sm:text-[15px] text-slate-400 max-w-md leading-relaxed">
                {data.sub}
              </p>
            </div>

            {/* Category tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {TABS.map((tab) => {
                const active = activeCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => selectCategory(tab.key)}
                    className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all duration-200 ${
                      active
                        ? `bg-white text-slate-900 shadow-lg ring-2 ${tab.activeRing}`
                        : "bg-white/[0.07] text-white/65 hover:bg-white/[0.13] border border-white/10"
                    }`}
                  >
                    <tab.Icon className={`w-3.5 h-3.5 ${active ? "text-blue-600" : "text-white/50"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Compact search card */}
            <div className="bg-white/[0.97] backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/30">

              {/* Search input + button */}
              <div className="flex gap-2 p-3 sm:p-3.5">
                <div className="flex-1 min-w-0">
                  <SmartSearch
                    category={activeCategory}
                    searchPath={data.path}
                    placeholder={data.placeholder}
                    trending={data.trending}
                    variant="hero"
                  />
                </div>
                <button
                  onClick={() => router.push(data.path)}
                  className="h-10 px-3 sm:px-5 bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-bold text-sm rounded-xl shrink-0 flex items-center gap-1.5 transition-all hover:shadow-lg hover:shadow-blue-500/40 active:scale-95"
                >
                  <span className="hidden xs:inline">Search</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Budget pills */}
              <div className="px-3 sm:px-3.5 pb-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0">Budget</span>
                <span className="w-px h-3 bg-gray-200 shrink-0" />
                {data.budgets.map((b) => (
                  <button
                    key={b.href}
                    onClick={() => router.push(b.href)}
                    className="text-[10px] sm:text-[11px] text-blue-700 font-bold bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 px-2.5 py-1 rounded-lg transition-all shrink-0 whitespace-nowrap"
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {/* Brands + quick links */}
              <div className="border-t border-gray-100 px-3 sm:px-3.5 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0">Brand</span>
                <span className="w-px h-3 bg-gray-200 shrink-0" />
                {data.brands.map((b) => (
                  <Link
                    key={b.slug}
                    href={`${data.path}?brand=${b.slug}`}
                    className="text-[10px] sm:text-[11px] text-slate-600 hover:text-blue-700 font-semibold bg-slate-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 px-2 sm:px-2.5 py-1 rounded-lg transition-all shrink-0 whitespace-nowrap"
                  >
                    {b.label}
                  </Link>
                ))}
                <span className="w-px h-3 bg-gray-200 shrink-0 ml-1" />
                {data.quickLinks.slice(0, 2).map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-[10px] sm:text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 whitespace-nowrap shrink-0 transition-colors"
                  >
                    {l.label}
                    <ChevronRight className="w-2.5 h-2.5" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap pt-0.5">
              {STATS.map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <s.Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="text-white font-bold text-sm">{s.value}</span>
                  <span className="text-slate-500 text-xs">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - showcase */}
          <div className="hidden lg:block relative">
            {SLIDES.map((slide, i) => {
              const ShowcaseIcon = slide.Icon;
              const isActive = i === activeIdx;
              return (
                <div
                  key={slide.cat}
                  className={`transition-all duration-700 ${
                    isActive
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3 absolute inset-0 pointer-events-none"
                  }`}
                >
                  <div className="glass-dark rounded-3xl p-5 shadow-2xl">
                    {/* Icon area */}
                    <div className="relative h-44 flex items-center justify-center mb-4 rounded-2xl overflow-hidden bg-white/[0.02]">
                      <div className={`absolute inset-0 bg-gradient-to-b ${slide.glow} opacity-60`} />
                      <div className="absolute w-40 h-40 border border-white/[0.07] rounded-full animate-spin-slow" />
                      <div
                        className="absolute w-28 h-28 border border-white/[0.05] rounded-full animate-spin-slow"
                        style={{ animationDirection: "reverse" }}
                      />
                      <div className="relative w-20 h-20 bg-white/[0.05] border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <ShowcaseIcon className="w-10 h-10 text-white/60" />
                      </div>
                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg px-2.5 py-1.5">
                        <p className="text-white text-[11px] font-bold">{slide.stat}</p>
                      </div>
                    </div>

                    {/* Trending list */}
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Trending this week
                    </p>
                    <div className="space-y-1.5 mb-4">
                      {CATEGORY_DATA[slide.cat].trending.slice(0, 4).map((name, ti) => (
                        <div
                          key={name}
                          className="flex items-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] rounded-xl px-3 py-2 cursor-pointer transition-all group"
                        >
                          <span className="text-slate-600 text-[10px] font-black w-4 shrink-0">
                            #{ti + 1}
                          </span>
                          <span className="text-white text-xs font-semibold flex-1 truncate group-hover:text-blue-300 transition-colors">
                            {name}
                          </span>
                          <TrendingUp className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors shrink-0" />
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href={CATEGORY_DATA[slide.cat].path}
                      className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl py-2.5 transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98]"
                    >
                      Browse {CATEGORY_DATA[slide.cat].label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Floating rating pill */}
                  <div className="absolute -top-3 -left-4 bg-white rounded-2xl px-3 py-2 shadow-xl shadow-black/20 flex items-center gap-2 border border-gray-100">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <div className="leading-none">
                      <p className="text-[10px] font-black text-slate-900">4.8 / 5</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">12K+ Reviews</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slide indicator dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === activeIdx
                ? `w-7 h-2 ${s.dot}`
                : "w-2 h-2 bg-white/25 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Auto-progress bar */}
      {!isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/[0.07] z-20 overflow-hidden">
          <div
            key={`pb-${activeIdx}`}
            className="h-full bg-blue-400/50"
            style={{ animation: "hero-progress 5s linear forwards" }}
          />
        </div>
      )}

      <style>{`
        @keyframes hero-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </section>
  );
}
