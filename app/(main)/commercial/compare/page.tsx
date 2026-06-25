import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftRight, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { BrandVehicleSelector } from "@/components/compare/BrandVehicleSelector";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = buildMetadata({
  title: "Compare Commercial Vehicles - Payload, Range & Price Comparison",
  description: "Compare trucks, pickups, and commercial vehicles side by side. Check payload, range, features, and price to make the best fleet decision.",
  keywords: "compare commercial vehicles india, truck comparison, pickup van comparison, cargo vehicle compare",
  canonicalPath: "/commercial/compare",
});

async function getPopularPairs() {
  const vehicles = await prisma.vehicle.findMany({
    where: { status: "PUBLISHED", type: "COMMERCIAL", isPopular: true },
    take: 8,
    orderBy: { viewCount: "desc" },
    select: {
      id: true, name: true, slug: true, priceDisplay: true, priceMin: true,
      brand: { select: { name: true, slug: true } },
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
  });
  const pairs: Array<[typeof vehicles[0], typeof vehicles[0]]> = [];
  for (let i = 0; i + 1 < vehicles.length; i += 2) pairs.push([vehicles[i], vehicles[i + 1]]);
  return pairs;
}

function PairCard({ a, b }: { a: { name: string; slug: string; priceDisplay: string | null; priceMin: number | null; images: Array<{ url: string }> }; b: typeof a }) {
  const price = (v: typeof a) => v.priceDisplay || (v.priceMin ? `₹${v.priceMin}L` : "TBD");
  return (
    <Link href={`/commercial/compare/${a.slug}-vs-${b.slug}`}
      className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all group block">
      <div className="relative flex gap-2 bg-slate-50 p-3">
        <div className="flex-1 relative h-16 bg-white rounded-lg overflow-hidden shadow-sm">
          <Image src={a.images[0]?.url || "/placeholder.svg"} alt={a.name} fill className="object-contain p-1" sizes="100px" />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-slate-800 text-white rounded-full flex items-center justify-center text-[8px] font-black shadow ring-2 ring-white z-10">VS</div>
        <div className="flex-1 relative h-16 bg-white rounded-lg overflow-hidden shadow-sm">
          <Image src={b.images[0]?.url || "/placeholder.svg"} alt={b.name} fill className="object-contain p-1" sizes="100px" />
        </div>
      </div>
      <div className="px-3 pb-3 pt-1.5">
        <div className="grid grid-cols-2 gap-1 mb-1.5">
          <div><p className="font-bold text-[11px] text-slate-900 truncate">{a.name}</p><p className="text-[10px] text-blue-700 font-semibold">{price(a)}</p></div>
          <div className="text-right"><p className="font-bold text-[11px] text-slate-900 truncate">{b.name}</p><p className="text-[10px] text-blue-700 font-semibold">{price(b)}</p></div>
        </div>
        <p className="text-center text-[10px] text-blue-600 font-semibold group-hover:underline">Compare →</p>
      </div>
    </Link>
  );
}

export default async function CommercialComparePage() {
  const pairs = await getPopularPairs();
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/" className="text-blue-200 hover:text-white text-xs">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbLink href="/commercial" className="text-blue-200 hover:text-white text-xs">Commercial</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbPage className="text-white text-xs">Compare</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2.5 mb-2">
            <ArrowLeftRight className="w-6 h-6 text-blue-300" />
            <h1 className="text-2xl sm:text-3xl font-bold">Compare Commercial Vehicles</h1>
          </div>
          <p className="text-blue-200 text-sm max-w-xl">Compare trucks, pickups, and cargo vehicles side by side on payload, range, specs, and price.</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-10">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Choose Commercial Vehicles to Compare</h2>
          <BrandVehicleSelector compareBasePath="/commercial/compare" type="COMMERCIAL" maxSelect={4} />
        </div>
        {pairs.length >= 2 && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Popular Commercial Comparisons</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {pairs.map(([a, b], i) => <PairCard key={i} a={a} b={b} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
