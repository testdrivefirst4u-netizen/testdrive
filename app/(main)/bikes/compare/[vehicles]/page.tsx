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
const BIKE_TYPES = ["BIKE", "SCOOTER"];

function parseVehicleSlugs(param: string): string[] {
  return param.split("-vs-").filter(Boolean);
}

async function fetchVehicles(slugs: string[]) {
  const results = await Promise.all(
    slugs.map((slug) =>
      prisma.vehicle.findFirst({
        where: { slug, status: "PUBLISHED", type: { in: BIKE_TYPES as any } },
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
  if (slugs.length < 2) return buildMetadata({ title: "Compare Bikes", description: "Compare bikes side by side", canonicalPath: "/bikes/compare" });
  const vehicles = await fetchVehicles(slugs);
  if (vehicles.length < 2) return buildMetadata({ title: "Compare Bikes", description: "Compare bikes side by side", canonicalPath: "/bikes/compare" });
  const names = vehicles.map((v) => `${v.brand.name} ${v.name}`).join(" vs ");
  const year = new Date().getFullYear();
  const sortedSlugs = [...slugs].sort();
  return buildMetadata({
    title: `${names} - Price, Specs & Mileage Comparison (${year})`,
    description: `Compare ${names} on price, engine, mileage, features & more. Which bike should you buy? Find out here.`,
    keywords: vehicles.map((v) => `${v.brand.name} ${v.name}`).join(", ") + `, bike comparison ${year}`,
    canonicalPath: `/bikes/compare/${sortedSlugs.join("-vs-")}`,
    ogImage: vehicles[0]?.images[0]?.url ?? undefined,
  });
}

export async function generateStaticParams() {
  try {
    const popular = await prisma.vehicle.findMany({
      where: { status: "PUBLISHED", type: { in: BIKE_TYPES as any }, isPopular: true },
      take: 10, orderBy: { viewCount: "desc" }, select: { slug: true },
    });
    const params: Array<{ vehicles: string }> = [];
    for (let i = 0; i < popular.length - 1; i++) {
      for (let j = i + 1; j < Math.min(i + 4, popular.length); j++) {
        params.push({ vehicles: `${popular[i].slug}-vs-${popular[j].slug}` });
      }
    }
    return params;
  } catch { return []; }
}

export default async function BikeCompareDetailPage({ params }: { params: Promise<{ vehicles: string }> }) {
  const { vehicles: slug } = await params;
  const slugs = parseVehicleSlugs(slug);
  if (slugs.length < 2 || slugs.length > 4) notFound();
  const sortedSlugs2 = [...slugs].sort();
  if (sortedSlugs2.join(",") !== slugs.join(",")) {
    redirect(`/bikes/compare/${sortedSlugs2.join("-vs-")}`);
  }
  const rawVehicles = await fetchVehicles(slugs);
  if (rawVehicles.length < 2) notFound();
  const vehicles = rawVehicles.map(serializeVehicle);

  const related = await prisma.vehicle.findMany({
    where: { status: "PUBLISHED", type: { in: BIKE_TYPES as any }, isPopular: true, id: { notIn: rawVehicles.map((v) => v.id) } },
    take: 6, orderBy: { viewCount: "desc" },
    select: { name: true, slug: true, priceDisplay: true, priceMin: true, brand: { select: { name: true, slug: true } }, images: { take: 1, orderBy: { sortOrder: "asc" } } },
  });

  const alsoCompare: Array<[typeof related[0], typeof related[0]]> = [];
  for (let i = 0; i + 1 < related.length; i += 2) alsoCompare.push([related[i], related[i + 1]]);

  await prisma.vehicle.updateMany({ where: { id: { in: rawVehicles.map((v) => v.id) } }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const compareUrl = `${SITE_URL}/bikes/compare/${slug}`;
  const names = vehicles.map((v) => `${v.brand.name} ${v.name}`);
  const year = new Date().getFullYear();

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Bikes", item: `${SITE_URL}/bikes` },
      { "@type": "ListItem", position: 3, name: "Compare Bikes", item: `${SITE_URL}/bikes/compare` },
      { "@type": "ListItem", position: 4, name: names.join(" vs "), item: compareUrl },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `Which is better ${vehicles[0].name} or ${vehicles[1].name}?`, acceptedAnswer: { "@type": "Answer", text: `Compare full specs above. ${vehicles[0].name} starts at ${vehicles[0].priceDisplay || "TBD"} while ${vehicles[1].name} starts at ${vehicles[1].priceDisplay || "TBD"}.` } },
      { "@type": "Question", name: `What is the mileage of ${vehicles[0].name} vs ${vehicles[1].name}?`, acceptedAnswer: { "@type": "Answer", text: `See the Mileage/Range row in the comparison table above for exact figures for both bikes.` } },
    ],
  };

  const price = (v: CompareVehicle) => v.priceDisplay || (v.priceMin ? `₹${v.priceMin} Lakh*` : "Price TBD");

  return (
    <div className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white pt-8 pb-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/" className="text-blue-200 hover:text-white text-xs">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbLink href="/bikes" className="text-blue-200 hover:text-white text-xs">Bikes</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbLink href="/bikes/compare" className="text-blue-200 hover:text-white text-xs">Compare</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbPage className="text-white text-xs">{names.join(" vs ")}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-xl sm:text-2xl font-bold mb-1">{names.join(" vs ")}</h1>
          <p className="text-blue-200 text-sm">Price, mileage, engine specs & features comparison</p>
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
                <Link key={i} href={`/bikes/compare/${a.slug}-vs-${b.slug}`}
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

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 text-base mb-4">FAQs — {vehicles[0].name} vs {vehicles[1].name}</h2>
          <div className="space-y-4">
            {[
              { q: `Which is better: ${vehicles[0].name} or ${vehicles[1].name}?`, a: `Both are popular choices. Compare specs, mileage, and features in the table above to decide.` },
              { q: `What is the price of ${vehicles[0].name} vs ${vehicles[1].name}?`, a: `${vehicles[0].name}: ${price(vehicles[0])} | ${vehicles[1].name}: ${price(vehicles[1])}. Visit the model pages for city-specific on-road prices.` },
            ].map((item, i) => (
              <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <p className="font-semibold text-sm text-slate-800 mb-1.5">{item.q}</p>
                <p className="text-sm text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/bikes/compare" className="text-xs bg-white border border-gray-200 text-blue-600 rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors">← Compare More Bikes</Link>
          {vehicles.map((v) => (
            <Link key={v.id} href={`/bikes/${v.brand.slug}/${v.slug}`} className="text-xs bg-white border border-gray-200 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors">View {v.name} Details</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
