import { NextRequest, NextResponse } from "next/server";
import { driverAuth } from "@/lib/auth-driver";
import prisma from "@/lib/prisma";

async function getDriverSession() {
  const session = await driverAuth();
  if (!session?.user) return null;
  const role = (session.user as any)?.role as string | undefined;
  if (role !== "DRIVER") return null;
  return session;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDriverSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const driverId = (session.user as any)?.id as string;
  const { id } = await params;

  const trip = await prisma.testDriveVisit.findUnique({ where: { id } });
  if (!trip || trip.assignedDriverId !== driverId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!["EN_ROUTE", "ARRIVED"].includes(trip.status)) {
    return NextResponse.json({ error: "Trip is not active" }, { status: 400 });
  }

  const { latitude, longitude } = await req.json();
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return NextResponse.json({ error: "latitude and longitude are required" }, { status: 400 });
  }

  const now = new Date();
  await Promise.all([
    prisma.tripLocationPing.create({
      data: { visitId: id, latitude, longitude, capturedAt: now },
    }),
    prisma.testDriveVisit.update({
      where: { id },
      data: { driverLastLat: latitude, driverLastLon: longitude, driverLastLocationAt: now },
    }),
  ]);

  return NextResponse.json({ success: true });
}
