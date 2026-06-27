import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { VehicleDetailPage } from "@/components/vehicle-detail-page";
import { buildMetadata, vehicleJsonLd, breadcrumbJsonLd } from "@/lib/seo";

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

  await prisma.vehicle.update({ where: { id: vehicle.id }, data: { viewCount: { increment: 1 } } });

  const similar = await prisma.vehicle.findMany({
    where: { type: "EV", status: "PUBLISHED", id: { not: vehicle.id } },
    take: 6,
    include: { brand: { select: { name: true, slug: true } }, images: { where: { sortOrder: 0 }, take: 1 } },
  });

  return <VehicleDetailPage vehicle={vehicle as any} similar={similar as any} vehicleType="ev" />;
}
