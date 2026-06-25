import Image from "next/image";
import Link from "next/link";
import { ArrowLeftRight, ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";

type V = {
  id: string; name: string; slug: string; type: string;
  priceMin: number | null; priceMax: number | null; priceDisplay: string | null;
  brand: { name: string; slug: string };
  images: Array<{ url: string }>;
};

async function getPopularForCompare(): Promise<V[]> {
  try {
    return await prisma.vehicle.findMany({
      where: { status: "PUBLISHED", isPopular: true, type: "CAR" },
      take: 8,
      orderBy: { viewCount: "desc" },
      select: {
        id: true, name: true, slug: true, type: true,
        priceMin: true, priceMax: true, priceDisplay: true,
        brand: { select: { name: true, slug: true } },
        images: { take: 1, select: { url: true } },
      },
    }) as unknown as V[];
  } catch { return []; }
}

function fmtPrice(v: V) {
  if (v.priceDisplay) return v.priceDisplay;
  if (v.priceMin && v.priceMax) return `₹${v.priceMin}–${v.priceMax} L`;
  if (v.priceMin) return `₹${v.priceMin} L*`;
  return "Price TBD";
}

function PairCard({ a, b }: { a: V; b: V }) {
  // Link directly to the SEO comparison page so vehicles pre-load
  const href = `/cars/compare/${a.slug}-vs-${b.slug}`;
  return (
    <Link
      href={href}
      className="flex-shrink-0 w-[290px] sm:w-[320px] bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 group block"
    >
      <div className="relative flex gap-2 bg-slate-50 p-3 h-[96px]">
        <div className="flex-1 relative bg-white rounded-xl overflow-hidden shadow-sm">
          <Image src={a.images[0]?.url || "/placeholder.svg"} alt={a.name} fill className="object-contain p-1" sizes="140px" />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-xl z-10 ring-2 ring-white">
          VS
        </div>
        <div className="flex-1 relative bg-white rounded-xl overflow-hidden shadow-sm">
          <Image src={b.images[0]?.url || "/placeholder.svg"} alt={b.name} fill className="object-contain p-1" sizes="140px" />
        </div>
      </div>
      <div className="px-4 pb-4 pt-2.5">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-[10px] text-gray-400 truncate">{a.brand.name}</p>
            <p className="font-bold text-sm text-slate-900 leading-tight truncate">{a.name}</p>
            <p className="text-xs text-blue-700 font-semibold">{fmtPrice(a)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 truncate">{b.brand.name}</p>
            <p className="font-bold text-sm text-slate-900 leading-tight truncate">{b.name}</p>
            <p className="text-xs text-blue-700 font-semibold">{fmtPrice(b)}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-blue-600 text-xs font-semibold group-hover:text-blue-700">
          <ArrowLeftRight className="w-3 h-3" />
          Compare Now
        </div>
      </div>
    </Link>
  );
}

export async function CompareSection() {
  const vehicles = await getPopularForCompare();
  if (vehicles.length < 4) return null;

  const pairs: Array<[V, V]> = [];
  for (let i = 0; i + 1 < vehicles.length; i += 2) pairs.push([vehicles[i], vehicles[i + 1]]);

  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-blue-700 font-semibold text-xs uppercase tracking-widest mb-1">Side by Side</p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Compare to buy the right car</h2>
          </div>
          <Link href="/cars/compare" className="hidden sm:flex items-center gap-1.5 text-blue-700 font-semibold text-sm hover:gap-2.5 transition-all">
            All Comparisons <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
          {pairs.map(([a, b], i) => <PairCard key={i} a={a} b={b} />)}
        </div>
        <div className="mt-5 sm:hidden">
          <Link href="/cars/compare" className="inline-flex items-center gap-1.5 text-blue-700 font-semibold text-sm">
            <ArrowLeftRight className="w-4 h-4" /> View All Comparisons
          </Link>
        </div>
      </div>
    </section>
  );
}
