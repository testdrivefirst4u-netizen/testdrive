import { NextRequest, NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";
import { notifyDealerTestDriveBooked } from "@/lib/notify";

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

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session.user as any)?.id as string;
  const dealerId = await getSessionDealerId(userId);
  if (!dealerId) return NextResponse.json({ error: "No dealer linked to your account" }, { status: 400 });

  const { id } = await params;
  const visit = await prisma.testDriveVisit.findUnique({
    where: { id },
    include: {
      lead: { select: { name: true, mobile: true, buyTime: true, preferredTime: true, address: true, city: true, latitude: true, longitude: true } },
      dealer: { select: { email: true, name: true } },
    },
  });

  if (!visit || visit.dealerId !== dealerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await notifyDealerTestDriveBooked({
    dealerEmail: visit.dealer.email,
    dealerName: visit.dealer.name,
    leadName: visit.lead.name,
    leadMobile: visit.lead.mobile,
    vehicleName: visit.vehicleName ?? undefined,
    scheduledDate: visit.lead.buyTime,
    scheduledTime: visit.lead.preferredTime,
    address: visit.lead.address ?? visit.lead.city,
    latitude: visit.lead.latitude,
    longitude: visit.lead.longitude,
  });

  return NextResponse.json({ success: true });
}
