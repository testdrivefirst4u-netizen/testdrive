import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://testdrivefirst.com";

// Regenerate sitemap every 12 hours
export const revalidate = 43200;

const BIKE_TYPES = ["BIKE", "SCOOTER"];

function typeToSlug(type: string): string {
  if (BIKE_TYPES.includes(type)) return "bikes";
  if (type === "EV")             return "ev";
  if (type === "COMMERCIAL")     return "commercial";
  return "cars";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let vehicles: any[] = [], news: any[] = [], blogs: any[] = [], brands: any[] = [];

  try {
    [vehicles, news, blogs, brands] = await Promise.all([
      prisma.vehicle.findMany({
        where:   { status: "PUBLISHED" },
        select:  {
          slug: true, type: true, name: true,
          brand:    { select: { slug: true, name: true } },
          images:   { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
          updatedAt: true,
          isPopular: true,
        },
      }),
      prisma.news.findMany({
        where:   { status: "PUBLISHED" },
        select:  { slug: true, title: true, coverImage: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take:    500,
      }),
      prisma.blog.findMany({
        where:   { status: "PUBLISHED" },
        select:  { slug: true, title: true, coverImage: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take:    500,
      }),
      prisma.brand.findMany({
        where:   { status: "PUBLISHED" },
        select:  { slug: true, name: true, updatedAt: true },
      }),
    ]);
  } catch {
    // DB unavailable at build time; regenerates on first request
  }

  /* ── Static pages ── */
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                              lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/cars`,                    lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/bikes`,                   lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/ev`,                      lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/commercial`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE_URL}/news`,                    lastModified: new Date(), changeFrequency: "hourly",  priority: 0.85 },
    { url: `${SITE_URL}/blog`,                    lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE_URL}/compare`,                 lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/cars/compare`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/bikes/compare`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/commercial/compare`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/test-drive`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/emi-calculator`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${SITE_URL}/car-loan`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/insurance`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/dealers`,                 lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/offers`,                  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/used-cars`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE_URL}/used-cars/explore`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
    { url: `${SITE_URL}/used-cars/sell`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/reviews`,                 lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/new-car-launches`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE_URL}/about`,                   lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/careers`,                 lastModified: new Date(), changeFrequency: "weekly",  priority: 0.5 },
    { url: `${SITE_URL}/privacy`,                 lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/terms`,                   lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  /* ── Brand pages ── */
  const brandPages: MetadataRoute.Sitemap = brands.map(b => ({
    url:             `${SITE_URL}/cars?brand=${b.slug}`,
    lastModified:    b.updatedAt,
    changeFrequency: "weekly" as const,
    priority:        0.75,
  }));

  /* ── Vehicle detail pages ── */
  const vehiclePages: MetadataRoute.Sitemap = vehicles.map(v => ({
    url:             `${SITE_URL}/${typeToSlug(v.type)}/${v.brand.slug}/${v.slug}`,
    lastModified:    v.updatedAt,
    changeFrequency: "weekly" as const,
    priority:        v.isPopular ? 0.85 : 0.75,
    // images field for image sitemap (improves image search indexing)
    ...(v.images[0]?.url ? { images: [v.images[0].url] } : {}),
  }));

  /* ── Popular compare pairs ── */
  function getBucket(type: string) {
    if (BIKE_TYPES.includes(type)) return "bikes";
    if (type === "COMMERCIAL")      return "commercial";
    return "cars";
  }
  const popularVehicles = vehicles.filter(v => v.isPopular);
  const buckets = new Map<string, typeof popularVehicles>();
  for (const v of popularVehicles) {
    const b = getBucket(v.type);
    if (!buckets.has(b)) buckets.set(b, []);
    buckets.get(b)!.push(v);
  }
  const comparePages: MetadataRoute.Sitemap = [];
  for (const [bucket, bVehicles] of buckets) {
    const top = bVehicles.slice(0, 12);
    for (let i = 0; i < top.length - 1; i++) {
      for (let j = i + 1; j < Math.min(i + 4, top.length); j++) {
        comparePages.push({
          url:             `${SITE_URL}/${bucket}/compare/${top[i].slug}-vs-${top[j].slug}`,
          lastModified:    new Date(),
          changeFrequency: "monthly" as const,
          priority:        0.65,
        });
      }
    }
  }

  /* ── News articles ── */
  const newsPages: MetadataRoute.Sitemap = news.map(n => ({
    url:             `${SITE_URL}/news/${n.slug}`,
    lastModified:    n.updatedAt,
    changeFrequency: "monthly" as const,
    priority:        0.65,
    ...(n.coverImage ? { images: [n.coverImage] } : {}),
  }));

  /* ── Blog posts ── */
  const blogPages: MetadataRoute.Sitemap = blogs.map(b => ({
    url:             `${SITE_URL}/blog/${b.slug}`,
    lastModified:    b.updatedAt,
    changeFrequency: "monthly" as const,
    priority:        0.6,
    ...(b.coverImage ? { images: [b.coverImage] } : {}),
  }));

  return [
    ...staticPages,
    ...brandPages,
    ...vehiclePages,
    ...comparePages,
    ...newsPages,
    ...blogPages,
  ];
}
