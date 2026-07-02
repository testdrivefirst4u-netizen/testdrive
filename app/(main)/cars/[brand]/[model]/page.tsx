import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { VehicleDetailPage } from "@/components/vehicle-detail-page";
import { buildMetadata, vehicleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const revalidate = 3600; // revalidate ISR every 1 hour

interface Props { params: Promise<{ brand: string; model: string }> }

export async function generateStaticParams() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: "PUBLISHED", type: "CAR" },
      select: { slug: true, brand: { select: { slug: true } } },
      take: 500,
    });
    return vehicles.map((v) => ({ brand: v.brand.slug, model: v.slug }));
  } catch {
    return [];
  }
}

async function getVehicle(brand: string, model: string) {
  return prisma.vehicle.findFirst({
    where: {
      slug: model,
      brand: { slug: brand },
      status: "PUBLISHED",
    },
    include: {
      brand: { select: { name: true, slug: true, logo: true } },
      category: { select: { name: true, slug: true } },
      variants: { where: { status: "PUBLISHED" }, orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      colours: { orderBy: { sortOrder: "asc" } },
      specGroups: {
        include: {
          group: true,
          specValues: { include: { specItem: true } },
        },
      },
      features: { orderBy: { sortOrder: "asc" } },
      faqs: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      seo: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, model } = await params;
  const vehicle = await getVehicle(brand, model);
  if (!vehicle) return {};

  const seo = vehicle.seo;
  return buildMetadata({
    title: seo?.metaTitle || `${vehicle.brand.name} ${vehicle.name} Price, Specs & Features`,
    description: seo?.metaDescription || vehicle.shortDescription || `${vehicle.brand.name} ${vehicle.name} - Check price, specifications, features, mileage, colours and variants. Get best deals.`,
    keywords: seo?.metaKeywords || `${vehicle.brand.name} ${vehicle.name}, ${vehicle.name} price, ${vehicle.name} specifications`,
    ogImage: seo?.ogImage || vehicle.images[0]?.url || vehicle.featuredImage || undefined,
    canonicalPath: `/cars/${brand}/${model}`,
  });
}

export default async function CarDetailPage({ params }: Props) {
  const { brand, model } = await params;
  const vehicle = await getVehicle(brand, model);

  if (!vehicle) notFound();

  prisma.vehicle
    .update({ where: { id: vehicle.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const similar = await prisma.vehicle.findMany({
    where: { brandId: vehicle.brandId, status: "PUBLISHED", id: { not: vehicle.id } },
    take: 6,
    include: { brand: { select: { name: true, slug: true } }, images: { where: { sortOrder: 0 }, take: 1 } },
  });

  const jsonLd = [
    vehicleJsonLd({
      name: vehicle.name,
      brand: vehicle.brand.name,
      description: vehicle.description,
      priceMin: vehicle.priceMin,
      priceMax: vehicle.priceMax,
      image: vehicle.images[0]?.url,
      url: `/cars/${brand}/${model}`,
    }),
    breadcrumbJsonLd([
      { name: "Home",              url: "/" },
      { name: "Cars",              url: "/cars" },
      { name: vehicle.brand.name, url: `/cars?brand=${brand}` },
      { name: vehicle.name,       url: `/cars/${brand}/${model}` },
    ]),
    ...(vehicle.faqs.length > 0 ? [faqJsonLd(
      vehicle.faqs.map(f => ({ question: f.question, answer: f.answer }))
    )] : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VehicleDetailPage vehicle={vehicle as any} similar={similar as any} vehicleType="car" />
    </>
  );
}
