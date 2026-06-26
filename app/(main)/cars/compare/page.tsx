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
  title: "Compare Cars Side by Side - Specs, Price & Features",
  description:
    "Compare any two or more cars side by side. Check engine specs, mileage, safety, features, and price to make the best buying decision.",
  keywords: "compare cars india, car comparison tool, car vs car india, best car comparison 2025",
  canonicalPath: "/cars/compare",
});

async function getPopularPairs() {
  try {
    const cars = await prisma.vehicle.findMany({
      where: { status: "PUBLISHED", type: "CAR", isPopular: true },
      take: 8,
      orderBy: { viewCount: "desc" },
      select: {
        id: true, name: true, slug: true, priceDisplay: true, priceMin: true,
        brand: { select: { name: true, slug: true } },
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
    });
    const pairs: Array<[typeof cars[0], typeof cars[0]]> = [];
    for (let i = 0; i + 1 < cars.length; i += 2) {
      pairs.push([cars[i], cars[i + 1]]);
    }
    return pairs;
  } catch {
    return [];
  }
}

function PairCard({ a, b }: { a: { name: string; slug: string; priceDisplay: string | null; priceMin: number | null; brand: { name: string; slug: string }; images: Array<{ url: string }> }; b: typeof a }) {
  const vsSlug = `${a.slug}-vs-${b.slug}`;
  const price = (v: typeof a) => v.priceDisplay || (v.priceMin ? `₹${v.priceMin}L` : "TBD");
  return (
    <Link
      href={`/cars/compare/${vsSlug}`}
      className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all group block"
    >
      <div className="relative flex gap-2 bg-slate-50 p-3">
        <div className="flex-1 relative h-16 bg-white rounded-lg overflow-hidden shadow-sm">
          <Image src={a.images[0]?.url || "/placeholder.svg"} alt={a.name} fill className="object-contain p-1" sizes="100px" />
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-slate-800 text-white rounded-full flex items-center justify-center text-[8px] font-black shadow ring-2 ring-white z-10">
          VS
        </div>
        <div className="flex-1 relative h-16 bg-white rounded-lg overflow-hidden shadow-sm">
          <Image src={b.images[0]?.url || "/placeholder.svg"} alt={b.name} fill className="object-contain p-1" sizes="100px" />
        </div>
      </div>
      <div className="px-3 pb-3 pt-1.5">
        <div className="grid grid-cols-2 gap-1 mb-1.5">
          <div>
            <p className="font-bold text-[11px] text-slate-900 truncate">{a.name}</p>
            <p className="text-[10px] text-blue-700 font-semibold">{price(a)}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[11px] text-slate-900 truncate">{b.name}</p>
            <p className="text-[10px] text-blue-700 font-semibold">{price(b)}</p>
          </div>
        </div>
        <p className="text-center text-[10px] text-blue-600 font-semibold group-hover:underline">Compare →</p>
      </div>
    </Link>
  );
}

export default async function CarsComparePage() {
  const pairs = await getPopularPairs();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://walley.broaddcast.com" },
      { "@type": "ListItem", position: 2, name: "Cars", item: "https://walley.broaddcast.com/cars" },
      { "@type": "ListItem", position: 3, name: "Compare Cars", item: "https://walley.broaddcast.com/cars/compare" },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/" className="text-blue-200 hover:text-white text-xs">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbLink href="/cars" className="text-blue-200 hover:text-white text-xs">Cars</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbPage className="text-white text-xs">Compare</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2.5 mb-2">
            <ArrowLeftRight className="w-6 h-6 text-blue-300" />
            <h1 className="text-2xl sm:text-3xl font-bold">Compare Cars</h1>
          </div>
          <p className="text-blue-200 text-sm max-w-xl">
            Select your brand, pick up to 4 models, and get a detailed side-by-side comparison of specs, features, price, and more.
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Selector */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Choose Vehicles to Compare</h2>
          <BrandVehicleSelector compareBasePath="/cars/compare" type="CAR" maxSelect={4} />
        </div>

        {/* Popular comparisons */}
        {pairs.length >= 2 && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Popular Car Comparisons</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {pairs.map(([a, b], i) => <PairCard key={i} a={a} b={b} />)}
            </div>
          </div>
        )}

        {/* How to use */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-slate-900 mb-4">How to Compare Cars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Select Brand", desc: "Choose the car brand from the left panel" },
              { step: "2", title: "Pick Models", desc: "Select 2 to 4 models you want to compare" },
              { step: "3", title: "Click Compare", desc: "Hit 'Compare Now' to see the full comparison" },
              { step: "4", title: "Decide Wisely", desc: "Review specs, features, and choose your car" },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-black text-sm flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
