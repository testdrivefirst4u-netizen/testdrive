import Link from "next/link";
import { ChevronRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { VehicleSlider, type SliderVehicle } from "./VehicleSlider";

interface VehicleSectionProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  viewAllLabel?: string;
  type?: string | string[];
  filter?: Record<string, any>;
  orderByPopular?: boolean;
  limit?: number;
  bgClass?: string;
  dark?: boolean;
}

async function fetchVehicles(
  type?: string | string[],
  filter?: Record<string, any>,
  orderByPopular?: boolean,
  limit = 14
): Promise<SliderVehicle[]> {
  try {
    const where: any = { status: "PUBLISHED", ...filter };
    if (type) {
      where.type = Array.isArray(type) ? { in: type } : type;
    }
    const orderBy: any = orderByPopular
      ? [{ isPopular: "desc" }, { featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
      : [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }];

    return await prisma.vehicle.findMany({
      where,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        priceMin: true,
        priceDisplay: true,
        isElectric: true,
        isPopular: true,
        isNew: true,
        isUpcoming: true,
        featured: true,
        availabilityStatus: true,
        bodyType: true,
        brand: { select: { name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        variants: {
          where: { isDefault: true },
          take: 1,
          select: { fuelType: true, transmission: true, mileage: true, range: true },
        },
      },
    }) as SliderVehicle[];
  } catch {
    return [];
  }
}

export async function VehicleSection({
  title,
  subtitle,
  viewAllLink,
  viewAllLabel = "View All",
  type,
  filter,
  orderByPopular,
  limit = 14,
  bgClass = "bg-white",
  dark = false,
}: VehicleSectionProps) {
  const vehicles = await fetchVehicles(type, filter, orderByPopular, limit);
  if (vehicles.length === 0) return null;

  const headingColor = dark ? "text-white" : "text-slate-900";
  const subtitleColor = dark ? "text-blue-300" : "text-blue-700";
  const linkColor = dark ? "text-blue-300 hover:text-white" : "text-blue-700 hover:text-blue-800";

  return (
    <section className={`py-10 ${bgClass}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            {subtitle && (
              <p className={`font-semibold text-xs uppercase tracking-widest mb-1 ${subtitleColor}`}>
                {subtitle}
              </p>
            )}
            <h2 className={`text-xl sm:text-2xl font-bold ${headingColor}`}>{title}</h2>
          </div>
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className={`flex items-center gap-1 font-semibold text-sm transition-all hover:gap-2 ${linkColor}`}
            >
              {viewAllLabel} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        <VehicleSlider vehicles={vehicles} />
      </div>
    </section>
  );
}
