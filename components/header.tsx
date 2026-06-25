"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, ChevronDown, ChevronRight,
  Car, Bike, Zap, Truck, Newspaper, Star, ArrowLeftRight,
  Calculator, Shield, MapPin, LogIn, Phone, PlugZap,
  Flame, TrendingUp, Clock, Headphones, User, Bookmark, Bell,
} from "lucide-react";
import { SearchDropdown } from "@/components/search-dropdown";

/* ─── Data ────────────────────────────────────────────────── */

const CARS_MEGA = {
  featured: [
    { icon: Flame,      label: "Popular Cars",  sub: "Best-selling models",   href: "/cars?sort=popularity", hot: true },
    { icon: TrendingUp, label: "New Launches",  sub: "Latest 2025–26 models", href: "/new-car-launches"              },
    { icon: Clock,      label: "Upcoming Cars", sub: "Coming soon this year", href: "/cars?upcoming=true"            },
    { icon: PlugZap,    label: "Electric Cars", sub: "Zero-emission vehicles",href: "/ev"                            },
  ],
  types: [
    { label: "SUVs",         href: "/cars?bodyType=SUV"      },
    { label: "Hatchbacks",   href: "/cars?bodyType=Hatchback" },
    { label: "Sedans",       href: "/cars?bodyType=Sedan"     },
    { label: "Luxury Cars",  href: "/cars?bodyType=Luxury"    },
    { label: "MUVs / MPVs", href: "/cars?bodyType=MUV"       },
    { label: "Pickup Trucks",href: "/cars?bodyType=Pickup"    },
  ],
  budget: [
    { label: "Under ₹5 Lakh",  href: "/cars?priceMax=5"              },
    { label: "₹5 – 10 Lakh",   href: "/cars?priceMin=5&priceMax=10"  },
    { label: "₹10 – 20 Lakh",  href: "/cars?priceMin=10&priceMax=20" },
    { label: "₹20 – 50 Lakh",  href: "/cars?priceMin=20&priceMax=50" },
    { label: "Above ₹50 Lakh", href: "/cars?priceMin=50"             },
  ],
};

const MORE_ITEMS = [
  { icon: Calculator, label: "EMI Calculator",  sub: "Plan your car loan",        href: "/emi-calculator" },
  { icon: Shield,     label: "Car Insurance",   sub: "Compare & save on premium", href: "/insurance"      },
  { icon: MapPin,     label: "Find Dealers",    sub: "Authorised near you",       href: "/dealers"        },
  // { icon: Star,       label: "Expert Reviews",  sub: "In-depth road tests",       href: "/reviews"        },
  { icon: Newspaper,  label: "Auto News",       sub: "Latest auto updates",       href: "/news"           },
  { icon: Headphones, label: "Support",         sub: "Help & contact us",         href: "/contact"        },
];

const MOBILE_NAV = [
  { icon: Car,            label: "New Cars",          href: "/cars",         accent: "text-blue-600",   bg: "bg-blue-50"   },
  { icon: Bike,           label: "Bikes & Scooters",  href: "/bikes",        accent: "text-orange-500", bg: "bg-orange-50" },
  { icon: PlugZap,        label: "Electric Vehicles", href: "/ev",           accent: "text-teal-600",   bg: "bg-teal-50"   },
  { icon: Truck,          label: "Commercial",        href: "/commercial",   accent: "text-purple-600", bg: "bg-purple-50" },
  { icon: ArrowLeftRight, label: "Compare Vehicles",  href: "/compare",      accent: "text-amber-600",  bg: "bg-amber-50"  },
  { icon: Calculator,     label: "EMI Calculator",    href: "/emi-calculator",accent:"text-blue-600",   bg: "bg-blue-50"   },
  // { icon: Star,           label: "Reviews",           href: "/reviews",      accent: "text-yellow-600", bg: "bg-yellow-50" },
  { icon: Newspaper,      label: "Auto News",         href: "/news",         accent: "text-slate-600",  bg: "bg-slate-100" },
  { icon: Shield,         label: "Car Insurance",     href: "/insurance",    accent: "text-rose-600",   bg: "bg-rose-50"   },
  { icon: MapPin,         label: "Find Dealers",      href: "/dealers",      accent: "text-green-600",  bg: "bg-green-50"  },
];

/* ─── Cars mega menu ──────────────────────────────────────── */

function CarsMegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-full left-0 mt-1 w-[680px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
      <div className="grid grid-cols-3 divide-x divide-gray-100">
        {/* Col 1 */}
        <div className="p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 mb-2">Explore</p>
          <Link href="/cars" onClick={onClose}
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-blue-50 group mb-1 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Car className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Browse All Cars</p>
              <p className="text-[10px] text-gray-400">All new car models</p>
            </div>
          </Link>
          {CARS_MEGA.featured.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-blue-50 group mb-0.5 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                    {item.label}
                    {item.hot && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">HOT</span>}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{item.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Col 2 */}
        <div className="p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 mb-2">By Body Type</p>
          <div className="space-y-0.5">
            {CARS_MEGA.types.map((t) => (
              <Link key={t.href} href={t.href} onClick={onClose}
                className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-blue-50 text-sm font-medium text-slate-700 hover:text-blue-700 group transition-colors">
                {t.label}
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Col 3 */}
        <div className="p-4 bg-slate-50/60">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 mb-2">By Budget</p>
          <div className="space-y-0.5">
            {CARS_MEGA.budget.map((b) => (
              <Link key={b.href} href={b.href} onClick={onClose}
                className="flex items-center justify-between px-2 py-2 rounded-xl hover:bg-blue-50 text-sm font-medium text-slate-700 hover:text-blue-700 group transition-colors">
                {b.label}
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </Link>
            ))}
          </div>
          <div className="mt-3 p-3 bg-blue-700 rounded-xl">
            <p className="text-xs font-bold text-white mb-0.5">Compare Cars Side-by-Side</p>
            <p className="text-[10px] text-blue-200 mb-2">Free tool · up to 3 vehicles</p>
            <Link href="/cars/compare" onClick={onClose}
              className="block text-center text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 rounded-lg py-1.5 transition-colors">
              Compare Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── More dropdown ───────────────────────────────────────── */

function MoreDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-2">
      {MORE_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 group transition-colors">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
              <Icon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors truncate">{item.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">{item.sub}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── Main Header ─────────────────────────────────────────── */

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu]     = useState<string | null>(null);
  const navRef   = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  /* Close mobile drawer on route change */
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const toggle = (key: string) => setOpenMenu((p) => (p === key ? null : key));
  const close  = () => setOpenMenu(null);

  const isActive = (path: string) =>
    pathname === path || (path !== "/" && pathname.startsWith(path));

  return (
    <>
      {/* ─── Sticky header ──────────────────────────────── */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center h-14 sm:h-16 gap-2" ref={navRef}>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="hidden xs:block leading-none">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight block">Walley</span>
                <span className="text-[8px] sm:text-[9px] font-semibold text-slate-400 tracking-wider uppercase">by Broaddcast</span>
              </div>
            </Link>

            {/* ── Desktop nav (lg+) ───────────────────── */}
            <nav className="hidden lg:flex items-center gap-0.5 ml-2 flex-1">
              {/* Cars */}
              <div className="relative">
                <button onClick={() => toggle("cars")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    openMenu === "cars" || isActive("/cars")
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                  }`}>
                  <Car className="w-3.5 h-3.5" /> Cars
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "cars" ? "rotate-180" : ""}`} />
                </button>
                {openMenu === "cars" && <CarsMegaMenu onClose={close} />}
              </div>

              {/* Bikes */}
              <Link href="/bikes"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive("/bikes") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                }`}>
                <Bike className="w-3.5 h-3.5" /> Bikes
              </Link>

              {/* Electric */}
              <Link href="/ev"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive("/ev") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                }`}>
                <PlugZap className="w-3.5 h-3.5" /> Electric
              </Link>

              {/* Commercial */}
              <Link href="/commercial"
                className={`hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive("/commercial") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                }`}>
                <Truck className="w-3.5 h-3.5" /> Commercial
              </Link>

              {/* Compare */}
              <Link href="/compare"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive("/compare") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                }`}>
                <ArrowLeftRight className="w-3.5 h-3.5" /> Compare
              </Link>

              {/* Reviews */}
              {/* <Link href="/reviews"
                className={`hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive("/reviews") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                }`}>
                <Star className="w-3.5 h-3.5" /> Reviews
              </Link> */}

              {/* News */}
              <Link href="/news"
                className={`hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive("/news") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                }`}>
                <Newspaper className="w-3.5 h-3.5" /> News
              </Link>

              {/* More */}
              <div className="relative">
                <button onClick={() => toggle("more")}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    openMenu === "more" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-blue-700 hover:bg-slate-50"
                  }`}>
                  More
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openMenu === "more" ? "rotate-180" : ""}`} />
                </button>
                {openMenu === "more" && <MoreDropdown onClose={close} />}
              </div>
            </nav>

            {/* ── Right side ─────────────────────────── */}
            <div className="flex items-center gap-1.5 ml-auto shrink-0">
              {/* Search bar — visible on md+ */}
              <div className="hidden md:block lg:w-44 xl:w-52">
                <SearchDropdown />
              </div>

              {/* Notification — lg+ */}
              <button className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-all">
                <Bell className="w-4 h-4" />
              </button>

              {/* Wishlist — lg+ */}
              <button className="hidden lg:flex w-9 h-9 items-center justify-center rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-all">
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Login — sm+ */}
              <Link href="/login"
                className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap">
                <User className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Login</span>
              </Link>

              {/* Book Test Drive — lg+ */}
              <Link href="/test-drive"
                className="hidden lg:flex items-center gap-1.5 h-9 px-3.5 xl:px-4 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition-all hover:shadow-lg hover:shadow-blue-500/30 whitespace-nowrap">
                Book Test Drive
              </Link>

              {/* Hamburger — below lg */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Open menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile drawer ───────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-[min(320px,90vw)] bg-white shadow-2xl flex flex-col animate-slide-right">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 text-sm leading-none">Walley</p>
                  <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">by Broaddcast</p>
                </div>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-100 shrink-0">
              <SearchDropdown />
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 no-scrollbar">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-3 mb-2">Browse</p>
              {MOBILE_NAV.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors mb-0.5 group ${
                      active ? "bg-blue-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl ${link.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${link.accent}`} />
                    </div>
                    <span className={`text-sm font-semibold flex-1 ${active ? "text-blue-700" : "text-slate-700 group-hover:text-blue-700"} transition-colors`}>
                      {link.label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </Link>
                );
              })}
            </nav>

            {/* Footer CTAs */}
            <div className="px-4 pt-3 pb-6 border-t border-gray-100 space-y-2 shrink-0">
              <Link
                href="/test-drive"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 h-11 w-full bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all"
              >
                Book Test Drive
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 h-10 border border-gray-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-semibold text-sm rounded-xl transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" /> Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-1.5 h-10 border border-gray-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-semibold text-sm rounded-xl transition-all"
                >
                  <User className="w-3.5 h-3.5" /> Register
                </Link>
              </div>
              <a
                href="tel:+911800123456"
                className="flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-blue-700 transition-colors pt-1"
              >
                <Phone className="w-3.5 h-3.5" /> 1800-123-4567 · Free helpline
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
