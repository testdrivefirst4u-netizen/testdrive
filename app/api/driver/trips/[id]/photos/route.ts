import { NextRequest, NextResponse } from "next/server";
import { driverAuth } from "@/lib/auth-driver";
import prisma from "@/lib/prisma";
import { imagekit } from "@/lib/imagekit";
import { haversineDistanceMeters } from "@/lib/geo";

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

  const trip = await prisma.testDriveVisit.findUnique({
    where: { id },
    include: { lead: { select: { latitude: true, longitude: true } } },
  });
  if (!trip || trip.assignedDriverId !== driverId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { file, fileName, latitude, longitude } = await req.json();
  if (!file || !fileName) {
    return NextResponse.json({ error: "file and fileName are required" }, { status: 400 });
  }

  let uploadedUrl: string;
  try {
    const uploaded = await imagekit.upload({
      file,
      fileName,
      folder: "/walley/test-drive-proof",
      useUniqueFileName: true,
    });
    uploadedUrl = uploaded.url;
  } catch (e: any) {
    console.error("[DRIVER PHOTO UPLOAD]", e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }

  const lat = typeof latitude === "number" ? latitude : null;
  const lon = typeof longitude === "number" ? longitude : null;

  let distanceFromCustomerM: number | null = trip.distanceFromCustomerM ?? null;
  if (lat != null && lon != null && trip.lead.latitude != null && trip.lead.longitude != null) {
    distanceFromCustomerM = haversineDistanceMeters(lat, lon, trip.lead.latitude, trip.lead.longitude);
  }

  const updated = await prisma.testDriveVisit.update({
    where: { id },
    data: {
      proofPhotos: { push: uploadedUrl },
      ...(lat != null && { visitLatitude: lat }),
      ...(lon != null && { visitLongitude: lon }),
      ...(distanceFromCustomerM != null && { distanceFromCustomerM }),
    },
  });

  return NextResponse.json({ trip: updated });
}
