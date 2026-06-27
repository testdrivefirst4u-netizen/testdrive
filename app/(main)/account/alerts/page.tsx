import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Bell, ArrowRight, IndianRupee, Target } from "lucide-react";
import { DeleteAlertButton } from "./DeleteAlertButton";

export const metadata: Metadata = {
  title: "Price Alerts | Walley",
  description: "Manage your price drop alerts on Walley.",
};

function formatPrice(price: number | null | undefined): string {
  if (!price) return "Price on request";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

export default async function PriceAlertsPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect("/login?callbackUrl=/account/alerts");

  const alerts = await prisma.priceAlert.findMany({
    where: { email: session.user.email ?? "", isActive: true },
    orderBy: { createdAt: "desc" },
  });

  const vehicles =
    alerts.length > 0
      ? await prisma.vehicle.findMany({
          where: { id: { in: alerts.map((a) => a.vehicleId) } },
          include: {
            brand: { select: { name: true, slug: true } },
            images: { orderBy: { sortOrder: "asc" }, take: 1 },
          },
        })
      : [];

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-500" />
          Price Alerts
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {alerts.length} active alert{alerts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-amber-300" />
          </div>
          <h2 className="font-bold text-gray-900 text-lg mb-2">No price alerts set</h2>
          <p className="text-sm text-gray-500 mb-6">
            Set a price alert on any vehicle page and we will notify you when the price drops.
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
          {alerts.map((alert) => {
            const vehicle = vehicleMap.get(alert.vehicleId);
            const image = vehicle?.images[0]?.url || vehicle?.featuredImage;
            const typeSlug =
              vehicle?.type === "CAR"
                ? "cars"
                : vehicle?.type === "BIKE" || vehicle?.type === "SCOOTER"
                ? "bikes"
                : vehicle?.type === "EV"
                ? "ev"
                : "cars";

            return (
              <div
                key={alert.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Image strip */}
                {vehicle && (
                  <div className="relative w-full h-36 bg-gray-50 overflow-hidden">
                    {image ? (
                      <Image
                        src={image}
                        alt={`${vehicle.brand.name} ${vehicle.name}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bell className="w-12 h-12 text-gray-200" />
                      </div>
                    )}
                    {/* Active badge */}
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        Active
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-4">
                  {vehicle ? (
                    <>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">
                        {vehicle.brand.name}
                      </p>
                      <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                        {vehicle.name}
                      </h3>

                      {/* Current price */}
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                        <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {vehicle.priceDisplay ||
                            formatPrice(vehicle.priceMin ?? undefined)}
                        </span>
                        <span className="text-gray-400 text-xs">current</span>
                      </div>

                      {/* Target price */}
                      {alert.targetPrice != null && (
                        <div className="flex items-center gap-1 mt-1 text-sm font-bold text-amber-700">
                          <Target className="w-3.5 h-3.5" />
                          Alert at {formatPrice(alert.targetPrice)}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Vehicle details unavailable</p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    {vehicle && (
                      <Link
                        href={`/${typeSlug}/${vehicle.brand.slug}/${vehicle.slug}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                      >
                        View Vehicle <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                    <DeleteAlertButton vehicleId={alert.vehicleId} />
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
