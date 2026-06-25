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

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseVehicleSlugs(param: string): string[] {
  return param.split("-vs-").filter(Boolean);
}

async function fetchVehicles(slugs: string[]) {
  const results = await Promise.all(
    slugs.map((slug) =>
      prisma.vehicle.findFirst({
        where: { slug, status: "PUBLISHED", type: "CAR" },
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
    id: v.id,
    name: v.name,
    slug: v.slug,
    type: v.type,
    priceMin: v.priceMin,
    priceMax: v.priceMax,
    priceDisplay: v.priceDisplay,
    isElectric: v.isElectric,
    pros: v.pros,
    cons: v.cons,
    brand: { name: v.brand.name, slug: v.brand.slug, logo: v.brand.logo },
    images: v.images.map((i) => ({ url: i.url })),
    variants: v.variants.map((va) => ({
      id: va.id,
      name: va.name,
      priceDisplay: va.priceDisplay,
      fuelType: va.fuelType,
      transmission: va.transmission,
      mileage: va.mileage,
      range: va.range,
      isDefault: va.isDefault,
    })),
    specGroups: v.specGroups.map((sg) => ({
      id: sg.id,
      group: { name: sg.group.name, slug: sg.group.slug, sortOrder: sg.group.sortOrder },
      specValues: sg.specValues.map((sv) => ({
        value: sv.value,
        specItem: { name: sv.specItem.name, unit: sv.specItem.unit, sortOrder: sv.specItem.sortOrder },
      })),
    })),
    features: v.features.map((f) => ({
      id: f.id,
      category: f.category,
      name: f.name,
      available: f.available,
      sortOrder: f.sortOrder,
    })),
  };
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ vehicles: string }> }): Promise<Metadata> {
  const { vehicles: slug } = await params;
  const slugs = parseVehicleSlugs(slug);
  if (slugs.length < 2) return buildMetadata({ title: "Compare Cars", description: "Compare cars side by side", canonicalPath: "/cars/compare" });

  const vehicles = await fetchVehicles(slugs);
  if (vehicles.length < 2) return buildMetadata({ title: "Compare Cars", description: "Compare cars side by side", canonicalPath: "/cars/compare" });

  const names = vehicles.map((v) => `${v.brand.name} ${v.name}`).join(" vs ");
  const year = new Date().getFullYear();

  // Canonical uses alphabetically sorted slugs so /a-vs-b and /b-vs-a share one canonical
  const sortedSlugs = [...slugs].sort();
  const canonicalSlug = sortedSlugs.join("-vs-");

  return buildMetadata({
    title: `${names} - Price, Specs & Features Comparison (${year})`,
    description: `Compare ${names} on price, engine specs, mileage, features, safety & more. Which one is better? Find out here.`,
    keywords: vehicles.map((v) => `${v.brand.name} ${v.name}`).join(", ") + `, car comparison ${year}, ${vehicles.map((v) => v.name).join(" vs ")}`,
    canonicalPath: `/cars/compare/${canonicalSlug}`,
    ogImage: vehicles[0]?.images[0]?.url ?? undefined,
  });
}

// ── Static params for popular combinations ────────────────────────────────────

export async function generateStaticParams() {
  try {
    const popular = await prisma.vehicle.findMany({
      where: { status: "PUBLISHED", type: "CAR", isPopular: true },
      take: 10,
      orderBy: { viewCount: "desc" },
      select: { slug: true },
    });

    const params: Array<{ vehicles: string }> = [];
    for (let i = 0; i < popular.length - 1; i++) {
      for (let j = i + 1; j < Math.min(i + 4, popular.length); j++) {
        params.push({ vehicles: `${popular[i].slug}-vs-${popular[j].slug}` });
      }
    }
    return params;
  } catch {
    return [];
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CarCompareDetailPage({ params }: { params: Promise<{ vehicles: string }> }) {
  const { vehicles: slug } = await params;
  const slugs = parseVehicleSlugs(slug);

  if (slugs.length < 2 || slugs.length > 4) notFound();

  // Redirect to canonical (alphabetically sorted) URL to avoid duplicate content
  const sortedSlugs = [...slugs].sort();
  if (sortedSlugs.join(",") !== slugs.join(",")) {
    redirect(`/cars/compare/${sortedSlugs.join("-vs-")}`);
  }

  const rawVehicles = await fetchVehicles(slugs);
  if (rawVehicles.length < 2) notFound();

  const vehicles = rawVehicles.map(serializeVehicle);

  // Fetch related comparisons (people also compare)
  const related = await prisma.vehicle.findMany({
    where: {
      status: "PUBLISHED",
      type: "CAR",
      isPopular: true,
      id: { notIn: rawVehicles.map((v) => v.id) },
    },
    take: 6,
    orderBy: { viewCount: "desc" },
    select: {
      name: true, slug: true, priceDisplay: true, priceMin: true,
      brand: { select: { name: true, slug: true } },
      images: { take: 1, orderBy: { sortOrder: "asc" } },
    },
  });

  // Build "also compare" pairs
  const alsoCompare: Array<[typeof related[0], typeof related[0]]> = [];
  for (let i = 0; i + 1 < related.length; i += 2) {
    alsoCompare.push([related[i], related[i + 1]]);
  }

  // Increment view counts
  await prisma.vehicle.updateMany({
    where: { id: { in: rawVehicles.map((v) => v.id) } },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  // ── JSON-LD Schemas ──
  const year = new Date().getFullYear();
  const names = vehicles.map((v) => `${v.brand.name} ${v.name}`);
  const fullTitle = `${names.join(" vs ")} Comparison ${year}`;
  const compareUrl = `${SITE_URL}/cars/compare/${slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Cars", item: `${SITE_URL}/cars` },
      { "@type": "ListItem", position: 3, name: "Compare Cars", item: `${SITE_URL}/cars/compare` },
      { "@type": "ListItem", position: 4, name: fullTitle, item: compareUrl },
    ],
  };

  const productSchemas = vehicles.map((v) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${v.brand.name} ${v.name}`,
    brand: { "@type": "Brand", name: v.brand.name },
    description: `${v.brand.name} ${v.name} price, specs, and features`,
    url: `${SITE_URL}/cars/${v.brand.slug}/${v.slug}`,
    image: v.images[0]?.url,
    offers: v.priceMin
      ? { "@type": "Offer", priceCurrency: "INR", price: String(Math.round(v.priceMin * 100000)), availability: "https://schema.org/InStock" }
      : undefined,
  }));

  // ── Dynamic FAQ generation ──
  function findSpecVal(v: CompareVehicle, keywords: string[]): string | null {
    for (const sg of v.specGroups) {
      for (const sv of sg.specValues) {
        if (keywords.some((k) => sv.specItem.name.toLowerCase().includes(k))) {
          return sv.specItem.unit ? `${sv.value} ${sv.specItem.unit}` : sv.value;
        }
      }
    }
    return null;
  }

  function buildFAQs(vs: CompareVehicle[]): Array<{ q: string; a: string }> {
    const n = vs.map((v) => `${v.brand.name} ${v.name}`);
    const p = (v: CompareVehicle) => v.priceDisplay || (v.priceMin ? `₹${v.priceMin} Lakh*` : "TBD");
    const faqs: Array<{ q: string; a: string }> = [];

    faqs.push({
      q: `Which is better: ${vs[0].name} or ${vs[1].name}?`,
      a: `Both are strong contenders in their segment. ${n[0]} (${p(vs[0])}) and ${n[1]} (${p(vs[1])}) cater to different priorities. Compare their full specs, features, and scores above to find the right fit for your needs and budget.`,
    });

    if (vs[0].priceMin && vs[1].priceMin) {
      const diff = Math.abs(vs[0].priceMin - vs[1].priceMin).toFixed(2);
      const cheaper = vs[0].priceMin <= vs[1].priceMin ? n[0] : n[1];
      faqs.push({
        q: `What is the price difference between ${vs[0].name} and ${vs[1].name}?`,
        a: `${cheaper} is ₹${diff} Lakh cheaper. ${n[0]} starts at ${p(vs[0])} while ${n[1]} starts at ${p(vs[1])} (ex-showroom). On-road prices vary by city.`,
      });
    }

    const isEV = vs.some((v) => v.isElectric);
    const effKws = isEV ? ["range", "real-world range", "wltp"] : ["mileage", "arai", "claimed mileage"];
    const effLabel = isEV ? "range" : "mileage";
    const effVals = vs.map((v) => findSpecVal(v, effKws));
    if (effVals.some((v) => v)) {
      faqs.push({
        q: `What is the ${effLabel} of ${vs[0].name} vs ${vs[1].name}?`,
        a: `${n[0]} offers ${effVals[0] || "—"} and ${n[1]} offers ${effVals[1] || "—"}${isEV ? " real-world range" : " claimed mileage"}. Actual figures may vary based on driving conditions.`,
      });
    }

    const powerVals = vs.map((v) => findSpecVal(v, ["max power", "power", "bhp", "motor power", "peak power"]));
    if (powerVals.some((v) => v)) {
      faqs.push({
        q: `Which has more power: ${vs[0].name} or ${vs[1].name}?`,
        a: `${n[0]} produces ${powerVals[0] || "—"} while ${n[1]} produces ${powerVals[1] || "—"}. Check the Performance section above for torque and acceleration figures.`,
      });
    }

    const safetyCounts = vs.map((v) => v.features.filter((f) => f.category.toLowerCase().includes("safety") && f.available).length);
    if (safetyCounts.some((c) => c > 0)) {
      const safer = safetyCounts[0] >= safetyCounts[1] ? n[0] : n[1];
      faqs.push({
        q: `Which is safer: ${vs[0].name} or ${vs[1].name}?`,
        a: `${n[0]} has ${safetyCounts[0]} standard safety features and ${n[1]} has ${safetyCounts[1]}. ${safer} has more safety equipment. Both should comply with applicable NCAP and Bharat NCAP safety norms.`,
      });
    }

    const featCounts = vs.map((v) => v.features.filter((f) => f.available).length);
    if (featCounts.some((c) => c > 0)) {
      const richer = featCounts[0] >= featCounts[1] ? n[0] : n[1];
      faqs.push({
        q: `Which has better features: ${vs[0].name} or ${vs[1].name}?`,
        a: `${n[0]} comes with ${featCounts[0]} features and ${n[1]} with ${featCounts[1]}. ${richer} is more feature-rich overall. See the Features Comparison section above for the complete list.`,
      });
    }

    return faqs.slice(0, 6);
  }

  const dynamicFAQs = buildFAQs(vehicles);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dynamicFAQs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const price = (v: CompareVehicle) => v.priceDisplay || (v.priceMin ? `₹${v.priceMin} Lakh*` : "Price TBD");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchemas) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white pt-8 pb-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/" className="text-blue-200 hover:text-white text-xs">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbLink href="/cars" className="text-blue-200 hover:text-white text-xs">Cars</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbLink href="/cars/compare" className="text-blue-200 hover:text-white text-xs">Compare</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem><BreadcrumbPage className="text-white text-xs truncate max-w-[200px]">{names.join(" vs ")}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-xl sm:text-2xl font-bold mb-2">{names.join(" vs ")}</h1>
          <p className="text-blue-200 text-sm">Detailed comparison — price, specs, features, pros &amp; cons</p>

          {/* Quick price row */}
          <div className="mt-6 flex gap-4 overflow-x-auto pb-1">
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

        {/* Main comparison section (client interactive) */}
        <CompareClientSection
          vehicles={vehicles}
          shareUrl={compareUrl}
        />

        {/* People also compare */}
        {alsoCompare.length >= 1 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-900 text-base mb-4">People Also Compare</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {alsoCompare.map(([a, b], i) => (
                <Link
                  key={i}
                  href={`/cars/compare/${a.slug}-vs-${b.slug}`}
                  className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="relative w-8 h-6 flex-shrink-0">
                    <Image src={a.images[0]?.url || "/placeholder.svg"} alt={a.name} fill className="object-contain" sizes="32px" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">vs</span>
                  <div className="relative w-8 h-6 flex-shrink-0">
                    <Image src={b.images[0]?.url || "/placeholder.svg"} alt={b.name} fill className="object-contain" sizes="32px" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-800 truncate group-hover:text-blue-700">{a.name} vs {b.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 text-base mb-4">
            Frequently Asked Questions — {vehicles[0].name} vs {vehicles[1].name}
          </h2>
          <div className="space-y-4">
            {dynamicFAQs.map((item, i) => (
              <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <p className="font-semibold text-sm text-slate-800 mb-1.5">{item.q}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related links */}
        <div className="flex flex-wrap gap-2">
          <Link href="/cars/compare" className="text-xs bg-white border border-gray-200 text-blue-600 rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors">
            ← Compare More Cars
          </Link>
          {vehicles.map((v) => (
            <Link
              key={v.id}
              href={`/cars/${v.brand.slug}/${v.slug}`}
              className="text-xs bg-white border border-gray-200 text-slate-600 rounded-full px-3 py-1.5 hover:bg-slate-50 transition-colors"
            >
              View {v.name} Details
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
