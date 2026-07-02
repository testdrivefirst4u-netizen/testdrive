import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { VehicleDetailPage } from "@/components/vehicle-detail-page";
import { buildMetadata, vehicleJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const revalidate = 3600;

interface Props { params: Promise<{ brand: string; model: string }> }

export async function generateStaticParams() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { status: "PUBLISHED", type: "EV" },
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
    where: { slug: model, brand: { slug: brand }, status: "PUBLISHED", type: "EV" },
    include: {
      brand: { select: { name: true, slug: true, logo: true } },
      category: { select: { name: true, slug: true } },
      variants: { where: { status: "PUBLISHED" }, orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" } },
      colours: { orderBy: { sortOrder: "asc" } },
      specGroups: { include: { group: true, specValues: { include: { specItem: true } } } },
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
  return buildMetadata({
    title: vehicle.seo?.metaTitle || `${vehicle.brand.name} ${vehicle.name} EV Price, Range & Specs`,
    description: vehicle.seo?.metaDescription || `${vehicle.brand.name} ${vehicle.name} Electric Vehicle - Check price, range, charging time, battery capacity and features.`,
    canonicalPath: `/ev/${brand}/${model}`,
  });
}

export default async function EVDetailPage({ params }: Props) {
  const { brand, model } = await params;
  const vehicle = await getVehicle(brand, model);
  if (!vehicle) notFound();

  prisma.vehicle
    .update({ where: { id: vehicle.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const similar = await prisma.vehicle.findMany({
    where: { type: "EV", status: "PUBLISHED", id: { not: vehicle.id } },
    take: 6,
    include: { brand: { select: { name: true, slug: true } }, images: { where: { sortOrder: 0 }, take: 1 } },
  });

  const jsonLd = [
    vehicleJsonLd({
      name: vehicle.name, brand: vehicle.brand.name,
      description: vehicle.description,
      priceMin: vehicle.priceMin, priceMax: vehicle.priceMax,
      image: vehicle.images[0]?.url,
      url: `/ev/${brand}/${model}`,
    }),
    breadcrumbJsonLd([
      { name: "Home",              url: "/" },
      { name: "Electric Vehicles", url: "/ev" },
      { name: vehicle.brand.name, url: `/ev?brand=${brand}` },
      { name: vehicle.name,       url: `/ev/${brand}/${model}` },
    ]),
    ...(vehicle.faqs.length > 0 ? [faqJsonLd(vehicle.faqs.map(f => ({ question: f.question, answer: f.answer })))] : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VehicleDetailPage vehicle={vehicle as any} similar={similar as any} vehicleType="ev" />
    </>
  );
}
