import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { VehicleDealerOffers } from "@/components/admin/vehicle-dealer-offers";

export default async function VehicleDealerOffersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [vehicle, offers, dealers] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    }),
    prisma.dealerVehicleOffer.findMany({
      where: { vehicleId: id },
      include: {
        dealer: { select: { id: true, name: true, city: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.dealer.findMany({
      select: { id: true, name: true, city: true, brandId: true },
      orderBy: [{ name: "asc" }],
    }),
  ]);

  if (!vehicle) notFound();

  const serialized = offers.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    validFrom: o.validFrom?.toISOString() ?? null,
    validUntil: o.validUntil?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dealer Offers</h1>
        <p className="text-sm text-gray-500 mt-1">{vehicle.name}</p>
      </div>
      <VehicleDealerOffers
        vehicleId={vehicle.id}
        vehicleName={vehicle.name}
        initialOffers={serialized}
        dealers={dealers}
      />
    </div>
  );
}
