import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, ChevronLeft, Calendar, Tag, ArrowRight,
  Flame, Clock, TrendingUp,
} from "lucide-react";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FindCarsFilter } from "@/components/find-cars-filter";

export const metadata: Metadata = {
  title: "New Car Launches 2025-26 in India | Prices & Reviews | Walley",
  description:
    "Explore all new car launches in India 2025–26. Get prices, specs, expert reviews and compare the latest models from Tata, Maruti, Hyundai, Mahindra & more.",
};

/* ── Static launch data ─────────────────────────────────── */

interface CarLaunch {
  id: number;
  name:      string;
  brand:     string;
  image:     string;
  price:     string;
  status:    "Launched" | "Upcoming" | "Expected";
  date:      string;
  tags:      string[];
  slug:      string;
}

const LAUNCHES: CarLaunch[] = [
  {
    id: 1,
    name: "Tata Harrier EV",
    brand: "Tata",
    image: "/placeholder.svg?height=220&width=340",
    price: "₹21.49 Lakh",
    status: "Launched",
    date: "Jun 2025",
    tags: ["Electric", "SUV", "7-Seater"],
    slug: "tata/tata-harrier-ev",
  },
  {
    id: 2,
    name: "Skoda Kodiaq",
    brand: "Skoda",
    image: "/placeholder.svg?height=220&width=340",
    price: "₹38.99 Lakh",
    status: "Launched",
    date: "May 2025",
    tags: ["SUV", "Luxury", "7-Seater"],
    slug: "skoda/skoda-kodiaq",
  },
  {
    id: 3,
    name: "Mahindra BE 6",
    brand: "Mahindra",
    image: "/placeholder.svg?height=220&width=340",
    price: "₹18.90 Lakh",
    status: "Launched",
    date: "Apr 2025",
    tags: ["Electric", "SUV", "5-Seater"],
    slug: "mahindra/mahindra-be-6",
  },
  {
    id: 4,
    name: "Hyundai Creta Electric",
    brand: "Hyundai",
    image: "/placeholder.svg?height=220&width=340",
    price: "₹17.99 Lakh",
    status: "Launched",
    date: "Mar 2025",
    tags: ["Electric", "SUV", "5-Seater"],
    slug: "hyundai/hyundai-creta-electric",
  },
  {
    id: 5,
    name: "Tata Curvv EV",
    brand: "Tata",
    image: "/placeholder.svg?height=220&width=340",
    price: "₹17.49 Lakh",
    status: "Launched",
    date: "Feb 2025",
    tags: ["Electric", "Coupe-SUV"],
    slug: "tata/tata-curvv-ev",
  },
  {
    id: 6,
    name: "Maruti Suzuki e Vitara",
    brand: "Maruti",
    image: "/placeholder.svg?height=220&width=340",
    price: "₹17.49 Lakh",
    status: "Launched",
    date: "Jan 2025",
    tags: ["Electric", "SUV"],
    slug: "maruti-suzuki/maruti-e-vitara",
  },
  {
    id: 7,
    name: "Kia Syros",
    brand: "Kia",
    image: "/placeholder.svg?height=220&width=340",
    price: "₹10.00 Lakh",
    status: "Upcoming",
    date: "Jul 2025",
    tags: ["SUV", "5-Seater"],
    slug: "kia/kia-syros",
  },
  {
    id: 8,
    name: "Volkswagen Golf GTI",
    brand: "Volkswagen",
    image: "/placeholder.svg?height=220&width=340",
    price: "₹53.00 Lakh",
    status: "Upcoming",
    date: "Aug 2025",
    tags: ["Hatchback", "Performance"],
    slug: "volkswagen/volkswagen-golf-gti",
  },
  {
    id: 9,
    name: "Honda Elevate EV",
    brand: "Honda",
    image: "/placeholder.svg?height=220&width=340",
    price: "₹18.00 Lakh",
    status: "Expected",
    date: "Q3 2025",
    tags: ["Electric", "SUV"],
    slug: "honda/honda-elevate-ev",
  },
];

const SECTION_TABS = [
  { key: "all",      label: "All",      icon: Flame  },
  { key: "launched", label: "Launched", icon: TrendingUp },
  { key: "upcoming", label: "Upcoming", icon: Clock  },
] as const;

const STATUS_STYLE = {
  Launched: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Upcoming: "bg-amber-50  text-amber-700  border-amber-100",
  Expected: "bg-blue-50   text-blue-700   border-blue-100",
};

/* ── Card ───────────────────────────────────────────────── */

function LaunchCard({ car }: { car: CarLaunch }) {
  return (
    <Link
      href={`/cars/${car.slug}`}
      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-50">
        <Image
          src={car.image}
          alt={car.name}
          width={340}
          height={220}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Status badge */}
        <span className={`absolute top-3 left-3 text-[11px] font-bold border px-2.5 py-1 rounded-full ${STATUS_STYLE[car.status]}`}>
          {car.status}
        </span>
        {/* Date badge */}
        <span className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-slate-600 text-[10px] font-semibold px-2 py-1 rounded-full border border-white/50">
          <Calendar className="w-3 h-3" /> {car.date}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">{car.brand}</p>
        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-700 transition-colors mb-2">
          {car.name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {car.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-gray-100 px-2 py-0.5 rounded-full">
              <Tag className="w-2.5 h-2.5" /> {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Ex-Showroom</p>
            <p className="text-base font-extrabold text-slate-900">{car.price}</p>
          </div>
          <span className="flex items-center gap-1 text-xs text-blue-700 font-bold group-hover:gap-1.5 transition-all">
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Page ───────────────────────────────────────────────── */

export default function NewCarLaunchesPage() {
  const counts = {
    all:      LAUNCHES.length,
    launched: LAUNCHES.filter((c) => c.status === "Launched").length,
    upcoming: LAUNCHES.filter((c) => c.status === "Upcoming" || c.status === "Expected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page header ──────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-slate-500 hover:text-blue-700 text-sm">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/cars" className="text-slate-500 hover:text-blue-700 text-sm">Cars</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-slate-900 font-semibold text-sm">New Car Launches</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">New Car Launches</h1>
              <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
                Stay updated with the latest car launches in India 2025–26. Explore prices, specs and expert reviews
                for all new cars from Tata, Maruti, Hyundai, Mahindra, Kia and more.
              </p>
            </div>
            <Link
              href="/cars"
              className="flex items-center gap-1.5 text-sm text-blue-700 font-semibold hover:gap-2 transition-all shrink-0 group"
            >
              All Cars <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Find by filter ───────────────────────────── */}
      <FindCarsFilter />

      {/* ── Launches grid ────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

        {/* Section header with status tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="section-eyebrow mb-1">2025 – 26</p>
            <h2 className="section-title">Latest Car Launches in India</h2>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            {SECTION_TABS.map((t) => (
              <div key={t.key}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  t.key === "all"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}>
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
                <span className="text-[10px] text-slate-400 font-medium">({counts[t.key]})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {LAUNCHES.map((car) => (
            <LaunchCard key={car.id} car={car} />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/cars"
            className="flex items-center gap-2 h-11 px-8 bg-white border-2 border-gray-200 hover:border-blue-500 text-slate-700 hover:text-blue-700 font-bold text-sm rounded-xl transition-all"
          >
            View All Cars <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Quick links bar ──────────────────────────── */}
      <div className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Browse by Category</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Popular Cars",      href: "/cars?sort=popularity"     },
              { label: "SUVs in India",     href: "/cars?bodyType=SUV"         },
              { label: "Hatchbacks",        href: "/cars?bodyType=Hatchback"   },
              { label: "Sedans",            href: "/cars?bodyType=Sedan"       },
              { label: "Electric Cars",     href: "/ev"                        },
              { label: "Cars Under ₹5L",    href: "/cars?priceMax=5"           },
              { label: "Cars Under ₹10L",   href: "/cars?priceMax=10"          },
              { label: "Luxury Cars",       href: "/cars?priceMin=50"          },
              { label: "7-Seater Cars",     href: "/cars?seats=7"              },
              { label: "Automatic Cars",    href: "/cars?transmission=Automatic"},
              { label: "Diesel Cars",       href: "/cars?fuelType=Diesel"      },
              { label: "Upcoming Cars",     href: "/cars?upcoming=true"        },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-700 font-medium bg-slate-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 px-3 py-1.5 rounded-full transition-all"
              >
                {l.label} <ChevronRight className="w-3 h-3" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
