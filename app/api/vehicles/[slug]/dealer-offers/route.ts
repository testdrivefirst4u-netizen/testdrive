import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { slug },
    select: { id: true, name: true, brandId: true },
  });

  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

  const now = new Date();

  // Active dealers for this brand
  const dealers = await prisma.dealer.findMany({
    where: {
      brandId: vehicle.brandId,
      status: "ACTIVE",
      isAvailable: true,
    },
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
      address: true,
      phone: true,
      logo: true,
      priority: true,
    },
    orderBy: [{ priority: "asc" }, { name: "asc" }],
  });

  // Active vehicle-specific offers (any dealer)
  const rawOffers = await prisma.dealerVehicleOffer.findMany({
    where: {
      vehicleId: vehicle.id,
      isActive: true,
      OR: [{ validUntil: null }, { validUntil: { gte: now } }],
    },
    select: {
      id: true,
      dealerId: true,
      variantName: true,
      offerPrice: true,
      discount: true,
      discountType: true,
      priceDisplay: true,
      validFrom: true,
      validUntil: true,
      notes: true,
    },
  });

  // Build a map: dealerId → offer
  const offerByDealer = new Map(rawOffers.map((o) => [o.dealerId, o]));

  // Merge: each dealer gets their offer attached (if any)
  const result = dealers.map((d) => ({
    id:          d.id,
    name:        d.name,
    city:        d.city,
    state:       d.state,
    address:     d.address,
    phone:       d.phone,
    logo:        d.logo,
    offer:       offerByDealer.get(d.id) ?? null,
  }));

  // Also include offers for dealers NOT in the active list (e.g. inactive dealer has offer)
  const dealerIds = new Set(dealers.map((d) => d.id));
  for (const o of rawOffers) {
    if (!dealerIds.has(o.dealerId)) {
      // fetch minimal dealer info
      const d = await prisma.dealer.findUnique({
        where: { id: o.dealerId },
        select: { id: true, name: true, city: true, state: true, address: true, phone: true, logo: true },
      });
      if (d) {
        result.push({ ...d, offer: o });
      }
    }
  }

  return NextResponse.json({ vehicle, dealers: result });
}
