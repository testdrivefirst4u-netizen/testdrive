import { NextRequest, NextResponse } from "next/server";
import { driverAuth } from "@/lib/auth-driver";
import prisma from "@/lib/prisma";
import { haversineDistanceMeters } from "@/lib/geo";
import { notifyCustomerTripUpdate } from "@/lib/notify";

async function getDriverSession() {
  const session = await driverAuth();
  if (!session?.user) return null;
  const role = (session.user as any)?.role as string | undefined;
  if (role !== "DRIVER") return null;
  return session;
}

// action: "start" | "pickup" | "end"
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDriverSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const driverId = (session.user as any)?.id as string;
  const { id } = await params;

  const trip = await prisma.testDriveVisit.findUnique({
    where: { id },
    include: {
      lead: { select: { name: true, email: true, latitude: true, longitude: true } },
      dealer: { select: { name: true } },
    },
  });
  if (!trip || trip.assignedDriverId !== driverId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { action, latitude, longitude, customerFeedback, customerRating } = body;

  const lat = typeof latitude === "number" ? latitude : null;
  const lon = typeof longitude === "number" ? longitude : null;
  const now = new Date();

  let data: any = {};

  if (action === "start" && trip.status === "SCHEDULED") {
    data = { status: "EN_ROUTE", tripStartLat: lat, tripStartLon: lon, tripStartAt: now };
  } else if (action === "pickup" && trip.status === "EN_ROUTE") {
    let pickupDistanceM: number | null = null;
    if (lat != null && lon != null && trip.lead.latitude != null && trip.lead.longitude != null) {
      pickupDistanceM = haversineDistanceMeters(lat, lon, trip.lead.latitude, trip.lead.longitude);
    }
    data = { status: "ARRIVED", pickupLat: lat, pickupLon: lon, pickupAt: now, pickupDistanceM };
  } else if (action === "end" && trip.status === "ARRIVED") {
    if (!customerFeedback || typeof customerRating !== "number") {
      return NextResponse.json({ error: "Feedback and rating are required to end the trip" }, { status: 400 });
    }

    const pings = await prisma.tripLocationPing.findMany({
      where: { visitId: id },
      orderBy: { capturedAt: "asc" },
      select: { latitude: true, longitude: true },
    });

    let distanceMeters = 0;
    if (pings.length >= 2) {
      for (let i = 1; i < pings.length; i++) {
        distanceMeters += haversineDistanceMeters(
          pings[i - 1].latitude, pings[i - 1].longitude,
          pings[i].latitude, pings[i].longitude
        );
      }
    } else if (trip.pickupLat != null && trip.pickupLon != null && lat != null && lon != null) {
      distanceMeters = haversineDistanceMeters(trip.pickupLat, trip.pickupLon, lat, lon);
    }

    data = {
      status: "COMPLETED",
      tripEndLat: lat,
      tripEndLon: lon,
      tripEndAt: now,
      completedAt: now,
      customerFeedback,
      customerRating: Math.max(1, Math.min(5, Math.round(customerRating))),
      tripDistanceKm: Math.round((distanceMeters / 1000) * 10) / 10,
    };
  } else {
    return NextResponse.json({ error: "Invalid action for current trip status" }, { status: 400 });
  }

  const updated = await prisma.testDriveVisit.update({ where: { id }, data });

  // Best-effort customer email — only sent if the customer provided one at booking time
  if (trip.lead.email && (action === "start" || action === "end")) {
    notifyCustomerTripUpdate({
      customerEmail: trip.lead.email,
      customerName: trip.lead.name,
      vehicleName: trip.vehicleName,
      dealerName: trip.dealer.name,
      event: action === "start" ? "started" : "completed",
    }).catch(() => {});
  }

  return NextResponse.json({ trip: updated });
}
