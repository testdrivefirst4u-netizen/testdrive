import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://testdrivefirst.com";

const BIKE_TYPES = ["BIKE", "SCOOTER"];

function typeToSlug(type: string): string {
  if (BIKE_TYPES.includes(type)) return "bikes";
  if (type === "EV") return "ev";
  if (type === "COMMERCIAL") return "commercial";
  return "cars";
}

function typeToComparePath(type: string): string {
  if (BIKE_TYPES.includes(type)) return "bikes/compare";
  if (type === "COMMERCIAL") return "commercial/compare";
  return "cars/compare";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let vehicles: any[] = [], news: any[] = [], blogs: any[] = [], brands: any[] = [];
  try {
    [vehicles, news, blogs, brands] = await Promise.all([
      prisma.vehicle.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, type: true, brand: { select: { slug: true } }, updatedAt: true, isPopular: true },
      }),
      prisma.news.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blog.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.brand.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
    ]);
  } catch {
    // DB unavailable at build time; sitemap will regenerate on first request
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/cars`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/bikes`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/ev`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/commercial`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/news`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    // Compare hubs
    { url: `${SITE_URL}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/cars/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/bikes/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/commercial/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    // Services
    { url: `${SITE_URL}/test-drive`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/emi-calculator`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/car-loan`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/insurance`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/dealers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/offers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    // Used Cars
    { url: `${SITE_URL}/used-cars`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/used-cars/explore`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/used-cars/sell`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/used-cars/absure`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    // Content
    { url: `${SITE_URL}/reviews`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    // Company
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/careers`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/advertise`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const vehiclePages: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${SITE_URL}/${typeToSlug(v.type)}/${v.brand.slug}/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Generate popular comparison pair URLs per vehicle type
  const popularVehicles = vehicles.filter((v) => v.isPopular);

  // Group by compare bucket (cars, bikes/scooters, commercial)
  function getBucket(type: string) {
    if (BIKE_TYPES.includes(type)) return "bikes";
    if (type === "COMMERCIAL") return "commercial";
    return "cars";
  }
  const buckets = new Map<string, typeof popularVehicles>();
  for (const v of popularVehicles) {
    const bucket = getBucket(v.type);
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket)!.push(v);
  }

  const comparePages: MetadataRoute.Sitemap = [];
  for (const [bucket, bVehicles] of buckets) {
    const top = bVehicles.slice(0, 12);
    for (let i = 0; i < top.length - 1; i++) {
      for (let j = i + 1; j < Math.min(i + 4, top.length); j++) {
        comparePages.push({
          url: `${SITE_URL}/${bucket}/compare/${top[i].slug}-vs-${top[j].slug}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.65,
        });
      }
    }
  }

  const newsPages: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${SITE_URL}/news/${n.slug}`,
    lastModified: n.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogPages: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...vehiclePages, ...comparePages, ...newsPages, ...blogPages];
}
