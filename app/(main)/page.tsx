import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { PopularBrands } from "@/components/popular-brands";
import { VehicleSection } from "@/components/home/VehicleSection";
import { CategoryNav } from "@/components/home/CategoryNav";
import { CompareSection } from "@/components/home/CompareSection";
import { ServicesSection } from "@/components/services-section";
import { StatsSection } from "@/components/stats-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { NewsSection } from "@/components/news-section";
import { buildMetadata } from "@/lib/seo";

/* ── SEO ────────────────────────────────────────────── */
export const metadata: Metadata = buildMetadata({
  title: "New Cars, Bikes & Electric Vehicles in India | Walley",
  description:
    "India's trusted auto marketplace — compare prices, read expert reviews, and explore 2,000+ new cars, bikes, and electric vehicles. EMI calculator, dealer finder and more.",
  keywords:
    "new cars india, bikes, electric vehicles, car prices, car comparison, maruti, hyundai, tata, honda, ola electric, ev india",
  canonicalPath: "/",
  ogImage: "/og-home.jpg",
});

/* ── Skeletons ─────────────────────────────────────── */
function VehicleSectionSkeleton({ dark = false }: { dark?: boolean }) {
  const card = dark ? "bg-white/10" : "bg-gray-100";
  const bg = dark ? "bg-blue-950" : "bg-white";
  const bar = dark ? "bg-white/20" : "bg-gray-100";
  return (
    <div className={`py-10 ${bg}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className={`h-3 w-24 rounded animate-pulse mb-2 ${bar}`} />
            <div className={`h-7 w-52 rounded animate-pulse ${bar}`} />
          </div>
          <div className={`h-5 w-20 rounded animate-pulse ${bar}`} />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[240px] sm:w-[260px]">
              <div className={`rounded-2xl border border-gray-100 overflow-hidden animate-pulse ${card}`}>
                <div className={`h-[148px] ${dark ? "bg-white/10" : "bg-gray-100"}`} />
                <div className="p-3 space-y-2">
                  <div className={`h-3 w-14 rounded ${dark ? "bg-white/10" : "bg-gray-100"}`} />
                  <div className={`h-4 w-3/4 rounded ${dark ? "bg-white/10" : "bg-gray-100"}`} />
                  <div className={`h-4 w-1/2 rounded ${dark ? "bg-white/10" : "bg-gray-100"}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BrandSkeleton() {
  return (
    <div className="py-10 bg-slate-50 border-y border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[88px] h-[106px] bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompareSkeleton() {
  return (
    <div className="py-10 bg-white border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mb-2" />
        <div className="h-7 w-64 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[310px] sm:w-[340px] h-[200px] bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://walley.broaddcast.com";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Broaddcast Walley",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: "India's trusted automotive marketplace for new cars, bikes, and electric vehicles.",
  contactPoint: { "@type": "ContactPoint", telephone: "+91-1800-123-4567", contactType: "customer service" },
  sameAs: ["https://www.facebook.com/broaddcast", "https://www.instagram.com/broaddcast"],
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Walley by Broaddcast",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/cars?search={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

/* ── Page ───────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd, webSiteJsonLd]) }} />
      {/* Hero */}
      <Hero />
      {/* <CategoryNav /> */}

      {/* Popular Brands */}
      <Suspense fallback={<BrandSkeleton />}>
        <PopularBrands />
      </Suspense>

      {/* ── CARS ────────────────────────────── */}
      <Suspense fallback={<VehicleSectionSkeleton />}>
        <VehicleSection
          title="Popular Cars"
          subtitle="Most Searched"
          viewAllLink="/cars"
          type="CAR"
          orderByPopular
          bgClass="bg-white"
        />
      </Suspense>

      <Suspense fallback={<VehicleSectionSkeleton />}>
        <VehicleSection
          title="New Car Launches"
          subtitle="Just Arrived"
          viewAllLink="/cars"
          filter={{ isNew: true }}
          bgClass="bg-slate-50"
        />
      </Suspense>

      <Suspense fallback={<VehicleSectionSkeleton />}>
        <VehicleSection
          title="SUVs & Crossovers"
          subtitle="Most Popular Body Type"
          viewAllLink="/cars?bodyType=SUV"
          type="CAR"
          filter={{ bodyType: { contains: "SUV", mode: "insensitive" } }}
          bgClass="bg-white"
        />
      </Suspense>

      {/* ── COMPARE ─────────────────────────── */}
      <Suspense fallback={<CompareSkeleton />}>
        <CompareSection />
      </Suspense>

      {/* ── ELECTRIC ────────────────────────── */}
      <Suspense fallback={<VehicleSectionSkeleton dark />}>
        <VehicleSection
          title="Electric Vehicles"
          subtitle="Go Green · Zero Emissions"
          viewAllLink="/ev"
          viewAllLabel="All EVs"
          filter={{ isElectric: true }}
          bgClass="bg-gradient-to-r from-blue-950 to-blue-900"
          dark
        />
      </Suspense>

      {/* Services */}
      <ServicesSection />

      {/* ── BIKES ───────────────────────────── */}
      <Suspense fallback={<VehicleSectionSkeleton />}>
        <VehicleSection
          title="Popular Bikes & Scooters"
          subtitle="Two Wheelers"
          viewAllLink="/bikes"
          type={["BIKE", "SCOOTER"]}
          orderByPopular
          bgClass="bg-white"
        />
      </Suspense>

      <Suspense fallback={<VehicleSectionSkeleton />}>
        <VehicleSection
          title="New Bike Launches"
          subtitle="Latest Two Wheelers"
          viewAllLink="/bikes"
          type={["BIKE", "SCOOTER"]}
          filter={{ isNew: true }}
          bgClass="bg-slate-50"
        />
      </Suspense>

      {/* ── UPCOMING ────────────────────────── */}
      <Suspense fallback={<VehicleSectionSkeleton />}>
        <VehicleSection
          title="Upcoming Vehicles"
          subtitle="Coming Soon"
          viewAllLink="/cars"
          filter={{ isUpcoming: true }}
          bgClass="bg-white"
        />
      </Suspense>

      {/* ── COMMERCIAL ──────────────────────── */}
      <Suspense fallback={<VehicleSectionSkeleton />}>
        <VehicleSection
          title="Commercial Vehicles"
          subtitle="Business Fleet"
          viewAllLink="/commercial"
          type="COMMERCIAL"
          bgClass="bg-slate-50"
        />
      </Suspense>

      {/* Stats */}
      <StatsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* News with tabs */}
      <Suspense fallback={<div className="h-64 bg-white" />}>
        <NewsSection />
      </Suspense>
    </div>
  );
}
