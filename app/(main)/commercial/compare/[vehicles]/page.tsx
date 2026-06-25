import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { CompareClientSection, type CompareVehicle } from "@/components/compare/CompareClientSection";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://walley.broaddcast.com";

function parseVehicleSlugs(param: string): string[] {
  return param.split("-vs-").filter(Boolean);
}

async function fetchVehicles(slugs: string[]) {
  const results = await Promise.all(
    slugs.map((slug) =>
      prisma.vehicle.findFirst({
        where: { slug, status: "PUBLISHED", type: "COMMERCIAL" },
        include: {
          brand: { select: { name: true, slug: true, logo: true } },
          category: { select: { name: true, slug: true } },
          variants: { where: { status: "PUBLISHED" }, orderBy: { sortOrder: "asc" } },
          images: { orderBy: { sortOrder: "asc" }, take: 3 },
          specGroups: {
            include: { group: true, specValues: { include: { specItem: true }, orderBy: { specItem: { sortOrder: "asc" } } } },
            orderBy: { group: { sortOrder: "asc" } },
          },
          features: { orderBy: { sortOrder: "asc" } },
        },
      })
    )
  );
  return results.filter((v): v is NonNullable<typeof v> => !!v);
}

function serializeVehicle(v: Awaited<ReturnType<typeof fetchVehicles>>[number]): CompareVehicle {
  return {
    id: v.id, name: v.name, slug: v.slug, type: v.type,
    priceMin: v.priceMin, priceMax: v.priceMax, priceDisplay: v.priceDisplay,
    isElectric: v.isElectric, pros: v.pros, cons: v.cons,
    brand: { name: v.brand.name, slug: v.brand.slug, logo: v.brand.logo },
    images: v.images.map((i) => ({ url: i.url })),
    variants: v.variants.map((va) => ({ id: va.id, name: va.name, priceDisplay: va.priceDisplay, fuelType: va.fuelType, transmission: va.transmission, mileage: va.mileage, range: va.range, isDefault: va.isDefault })),
    specGroups: v.specGroups.map((sg) => ({ id: sg.id, group: { name: sg.group.name, slug: sg.group.slug, sortOrder: sg.group.sortOrder }, specValues: sg.specValues.map((sv) => ({ value: sv.value, specItem: { name: sv.specItem.name, unit: sv.specItem.unit, sortOrder: sv.specItem.sortOrder } })) })),
    features: v.features.map((f) => ({ id: f.id, category: f.category, name: f.name, available: f.available, sortOrder: f.sortOrder })),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ vehicles: string }> }): Promise<Metadata> {
  const { vehicles: slug } = await params;
  const slugs = parseVehicleSlugs(slug);
  if (slugs.length < 2) return buildMetadata({ title: "Compare Commercial Vehicles", description: "Compare commercial vehicles", canonicalPath: "/commercial/compare" });
  const vehicles = await fetchVehicles(slugs);
  if (vehicles.length < 2) return buildMetadata({ title: "Compare Commercial Vehicles", description: "Compare commercial vehicles", canonicalPath: "/commercial/compare" });
  const names = vehicles.map((v) => `${v.brand.name} ${v.name}`).join(" vs ");
  const year = new Date().getFullYear();
  const sortedSlugs = [...slugs].sort();
  return buildMetadata({
    title: `${names} - Payload, Range & Price Comparison (${year})`,
    description: `Compare ${names} on payload capacity, range, price, and features. Choose the best commercial vehicle for your business.`,
    keywords: vehicles.map((v) => `${v.brand.name} ${v.name}`).join(", ") + `, commercial vehicle comparison ${year}`,
    canonicalPath: `/commercial/compare/${sortedSlugs.join("-vs-")}`,
    ogImage: vehicles[0]?.images[0]?.url ?? undefined,
  });
}

export async function generateStaticParams() {
  try {
    const popular = await prisma.vehicle.findMany({
      where: { status: "PUBLISHED", type: "COMMERCIAL", isPopular: true },
      take: 8, orderBy: { viewCount: "desc" }, select: { slug: true },
    });
    const params: Array<{ vehicles: string }> = [];
    for (let i = 0; i < popular.length - 1; i++) {
      for (let j = i + 1; j < Math.min(i + 3, popular.length); j++) {
        params.push({ vehicles: `${popular[i].slug}-vs-${popular[j].slug}` });
      }
    }
    return params;
  } catch { return []; }
}

export default async function CommercialCompareDetailPage({ params }: { params: Promise<{ vehicles: string }> }) {
  const { vehicles: slug } = await params;
  const slugs = parseVehicleSlugs(slug);
  if (slugs.length < 2 || slugs.length > 4) notFound();
  const sortedSlugsC = [...slugs].sort();
  if (sortedSlugsC.join(",") !== slugs.join(",")) {
    redirect(`/commercial/compare/${sortedSlugsC.join("-vs-")}`);
  }
  const rawVehicles = await fetchVehicles(slugs);
  if (rawVehicles.length < 2) notFound();
  const vehicles = rawVehicles.map(serializeVehicle);

  const related = await prisma.vehicle.findMany({
    where: { status: "PUBLISHED", type: "COMMERCIAL", isPopular: true, id: { notIn: rawVehicles.map((v) => v.id) } },
    take: 6, orderBy: { viewCount: "desc" },
    select: { name: true, slug: true, priceDisplay: true, priceMin: true, brand: { select: { name: true, slug: true } }, images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  const alsoCompare: Array<[typeof related[0], typeof related[0]]> = [];
  for (let i = 0; i + 1 < related.length; i += 2) alsoCompare.push([related[i], related[i + 1]]);

  await prisma.vehicle.updateMany({ where: { id: { in: rawVehicles.map((v) => v.id) } }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const compareUrl = `${SITE_URL}/commercial/compare/${slug}`;
  const names = vehicles.map((v) => `${v.brand.name} ${v.name}`);
  const price = (v: CompareVehicle) => v.priceDisplay || (v.priceMin ? `₹${v.priceMin} Lakh*` : "Price TBD");

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Commercial", item: `${SITE_URL}/commercial` },
      { "@type": "ListItem", position: 3, name: "Compare", item: `${SITE_URL}/commercial/compare` },
      { "@type": "ListItem", position: 4, name: names.join(" vs "), item: compareUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white pt-8 pb-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/" className="text-blue-200 hover:text-white text-xs">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbLink href="/commercial" className="text-blue-200 hover:text-white text-xs">Commercial</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbLink href="/commercial/compare" className="text-blue-200 hover:text-white text-xs">Compare</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbPage className="text-white text-xs">{names.join(" vs ")}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl sm:text-2xl font-bold mb-1">{names.join(" vs ")}</h1>
          <p className="text-blue-200 text-sm">Payload, range, specs & price comparison for commercial vehicles</p>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
            {vehicles.map((v, i) => (
              <div key={v.id} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 flex-shrink-0">
                {i > 0 && <span className="text-blue-300 text-xs font-bold mr-1">vs</span>}
                <div className="w-10 h-8 relative flex-shrink-0">
                  <Image src={v.images[0]?.url || "/placeholder.svg"} alt={v.name} fill className="object-contain" sizes="40px" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{v.name}</p>
                  <p className="text-[10px] text-blue-200">{price(v)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        <CompareClientSection vehicles={vehicles} shareUrl={compareUrl} />

        {alsoCompare.length >= 1 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-900 text-base mb-4">People Also Compare</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {alsoCompare.map(([a, b], i) => (
                <Link key={i} href={`/commercial/compare/${a.slug}-vs-${b.slug}`}
                  className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                  <div className="relative w-8 h-6 flex-shrink-0"><Image src={a.images[0]?.url || "/placeholder.svg"} alt={a.name} fill className="object-contain" sizes="32px" /></div>
                  <span className="text-[10px] font-bold text-gray-400">vs</span>
                  <div className="relative w-8 h-6 flex-shrink-0"><Image src={b.images[0]?.url || "/placeholder.svg"} alt={b.name} fill className="object-contain" sizes="32px" /></div>
                  <p className="text-[10px] font-bold text-slate-800 truncate group-hover:text-blue-700">{a.name} vs {b.name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Link href="/commercial/compare" className="text-xs bg-white border border-gray-200 text-blue-600 rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors">← Compare More Vehicles</Link>
          {vehicles.map((v) => (
            <Link key={v.id} href={`/commercial/${v.brand.slug}/${v.slug}`} className="text-xs bg-white border border-gray-200 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">View {v.name} Details</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
