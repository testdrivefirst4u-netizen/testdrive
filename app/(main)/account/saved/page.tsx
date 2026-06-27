import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Heart, ArrowRight, IndianRupee } from "lucide-react";
import { RemoveButton } from "./RemoveButton";

export const metadata: Metadata = {
  title: "Saved Vehicles | Walley",
  description: "Your saved vehicles on Walley.",
};

function formatPrice(price: number | null | undefined): string {
  if (!price) return "Price on request";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export default async function SavedVehiclesPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect("/login?callbackUrl=/account/saved");

  const saved = await prisma.savedVehicle.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const vehicles =
    saved.length > 0
      ? await prisma.vehicle.findMany({
          where: { id: { in: saved.map((s) => s.vehicleId) } },
          include: {
            brand: { select: { name: true, slug: true } },
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        })
      : [];

  // Preserve saved order
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  const ordered = saved
    .map((s) => vehicleMap.get(s.vehicleId))
    .filter(Boolean) as typeof vehicles;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          Saved Vehicles
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {ordered.length} vehicle{ordered.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      {ordered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-rose-300" />
          </div>
          <h2 className="font-bold text-gray-900 text-lg mb-2">No saved vehicles yet</h2>
          <p className="text-sm text-gray-500 mb-6">
            Browse vehicles and tap the heart icon to save them here.
          </p>
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Browse Vehicles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ordered.map((vehicle) => {
            const image = vehicle.images[0]?.url || vehicle.featuredImage;
            const typeSlug =
              vehicle.type === "CAR"
                ? "cars"
                : vehicle.type === "BIKE" || vehicle.type === "SCOOTER"
                ? "bikes"
                : vehicle.type === "EV"
                ? "ev"
                : "cars";

            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                {/* Image */}
                <div className="relative w-full h-44 bg-gray-50 overflow-hidden">
                  {image ? (
                    <Image
                      src={image}
                      alt={`${vehicle.brand.name} ${vehicle.name}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Heart className="w-12 h-12 text-gray-200" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">
                    {vehicle.brand.name}
                  </p>
                  <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                    {vehicle.name}
                  </h3>

                  <div className="flex items-center gap-1 mt-2 text-sm font-bold text-gray-800">
                    {vehicle.priceDisplay ? (
                      <span>{vehicle.priceDisplay}</span>
                    ) : (
                      <>
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>
                          {formatPrice(vehicle.priceMin ?? undefined)}
                          {vehicle.priceMax && vehicle.priceMax !== vehicle.priceMin
                            ? ` – ${formatPrice(vehicle.priceMax)}`
                            : ""}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <Link
                      href={`/${typeSlug}/${vehicle.brand.slug}/${vehicle.slug}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                    <RemoveButton vehicleId={vehicle.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
