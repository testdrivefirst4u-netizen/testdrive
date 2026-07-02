import { NextRequest, NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";
import { imagekit } from "@/lib/imagekit";
import { haversineDistanceMeters } from "@/lib/geo";

async function getDealerSession() {
  const session = await dealerAuth();
  if (!session?.user) return null;
  const role = (session.user as any)?.role as string | undefined;
  if (!["DEALER_ADMIN", "SALES_EXECUTIVE"].includes(role ?? "")) return null;
  return session;
}

async function getSessionDealerId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      adminDealer: { select: { id: true } },
      dealer:      { select: { id: true } },
    },
  });
  return user?.adminDealer?.id ?? user?.dealer?.id ?? null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session.user as any)?.id as string;
  const dealerId = await getSessionDealerId(userId);
  if (!dealerId) return NextResponse.json({ error: "No dealer linked to your account" }, { status: 400 });

  const { id } = await params;
  const visit = await prisma.testDriveVisit.findUnique({
    where: { id },
    include: { lead: { select: { latitude: true, longitude: true } } },
  });
  if (!visit || visit.dealerId !== dealerId) {
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
    console.error("[TEST DRIVE PHOTO UPLOAD]", e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }

  const lat = typeof latitude === "number" ? latitude : null;
  const lon = typeof longitude === "number" ? longitude : null;

  let distanceFromCustomerM: number | null = visit.distanceFromCustomerM ?? null;
  if (lat != null && lon != null && visit.lead.latitude != null && visit.lead.longitude != null) {
    distanceFromCustomerM = haversineDistanceMeters(lat, lon, visit.lead.latitude, visit.lead.longitude);
  }

  const updated = await prisma.testDriveVisit.update({
    where: { id },
    data: {
      proofPhotos: { push: uploadedUrl },
      ...(lat != null && { visitLatitude: lat }),
      ...(lon != null && { visitLongitude: lon }),
      ...(distanceFromCustomerM != null && { distanceFromCustomerM }),
      ...(visit.status === "SCHEDULED" || visit.status === "EN_ROUTE"
        ? { status: "ARRIVED", arrivedAt: visit.arrivedAt ?? new Date() }
        : {}),
    },
  });

  return NextResponse.json({ visit: updated });
}
