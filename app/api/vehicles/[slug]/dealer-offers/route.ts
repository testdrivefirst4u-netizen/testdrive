import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });

  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });

  const now = new Date();

  const offers = await prisma.dealerVehicleOffer.findMany({
    where: {
      vehicleId: vehicle.id,
      isActive: true,
      OR: [
        { validUntil: null },
        { validUntil: { gte: now } },
      ],
    },
    include: {
      dealer: { select: { id: true, name: true, city: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ vehicle, offers });
}
