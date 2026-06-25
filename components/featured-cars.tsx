import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Zap, Star } from "lucide-react";
import prisma from "@/lib/prisma";

async function getFeaturedVehicles() {
  try {
    const featured = await prisma.vehicle.findMany({
      where: { status: "PUBLISHED", featured: true },
      take: 8,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        brand: { select: { name: true, slug: true, logo: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: {
          where: { isDefault: true },
          take: 1,
          select: { fuelType: true, transmission: true, mileage: true, range: true },
        },
      },
    });

    if (featured.length > 0) return featured;

    // Fallback: show any published vehicles
    return prisma.vehicle.findMany({
      where: { status: "PUBLISHED" },
      take: 8,
      orderBy: [{ isPopular: "desc" }, { createdAt: "desc" }],
      include: {
        brand: { select: { name: true, slug: true, logo: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        variants: {
          where: { isDefault: true },
          take: 1,
          select: { fuelType: true, transmission: true, mileage: true, range: true },
        },
      },
    });
  } catch {
    return [];
  }
}

function typeToPath(type: string) {
  if (type === "BIKE" || type === "SCOOTER") return "bikes";
  if (type === "EV") return "ev";
  if (type === "COMMERCIAL") return "commercial";
  return "cars";
}

export async function FeaturedCars() {
  const vehicles = await getFeaturedVehicles();
  if (vehicles.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-blue-700 font-semibold text-xs uppercase tracking-widest mb-1">
              Hand-Picked for You
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured Vehicles</h2>
          </div>
          <Link
            href="/cars"
            className="hidden md:flex items-center gap-1 text-blue-700 font-semibold text-sm hover:gap-2 transition-all"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {vehicles.map((v) => {
            const img = v.images[0]?.url || "/placeholder.svg";
            const variant = v.variants[0];
            const href = `/${typeToPath(v.type)}/${v.brand.slug}/${v.slug}`;
            const isEV = v.isElectric || v.type === "EV";

            return (
              <Link
                key={v.id}
                href={href}
                className="group block rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white"
              >
                <div className="relative h-44 overflow-hidden bg-gray-50">
                  <Image
                    src={img} alt={v.name} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    {(v as any).featured && (
                      <Badge className="bg-amber-400 text-amber-900 border-0 text-[10px]">
                        <Star className="w-2.5 h-2.5 mr-0.5 fill-current" />Top Pick
                      </Badge>
                    )}
                    {v.isNew && <Badge className="bg-emerald-500 text-white border-0 text-[10px]">New</Badge>}
                    {isEV && <Badge className="bg-teal-500 text-white border-0 text-[10px]"><Zap className="w-2.5 h-2.5 mr-0.5" />EV</Badge>}
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-400 mb-0.5">{v.brand.name}</p>
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors leading-tight mb-1">
                    {v.name}
                  </h3>
                  <p className="text-base font-bold text-blue-700 mb-3">
                    {v.priceDisplay || (v.priceMin ? `₹${v.priceMin} Lakh` : "Price TBD")}
                  </p>
                  <div className="flex gap-2 flex-wrap text-xs text-gray-500">
                    {variant?.fuelType && (
                      <span className="bg-slate-50 border border-gray-100 px-2 py-0.5 rounded-full">
                        {variant.fuelType}
                      </span>
                    )}
                    {variant?.transmission && (
                      <span className="bg-slate-50 border border-gray-100 px-2 py-0.5 rounded-full">
                        {variant.transmission}
                      </span>
                    )}
                    {(variant?.mileage || variant?.range) && (
                      <span className="bg-slate-50 border border-gray-100 px-2 py-0.5 rounded-full">
                        {isEV ? variant.range : variant.mileage}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
