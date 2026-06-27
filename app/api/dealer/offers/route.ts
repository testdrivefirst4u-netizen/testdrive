import { NextRequest, NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";

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

export async function GET(req: NextRequest) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session.user as any)?.id as string;
  const dealerId = await getSessionDealerId(userId);
  if (!dealerId) return NextResponse.json({ error: "No dealer linked to your account" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId") ?? undefined;

  const offers = await prisma.dealerVehicleOffer.findMany({
    where: {
      dealerId,
      ...(vehicleId ? { vehicleId } : {}),
    },
    include: {
      vehicle: { select: { id: true, name: true, slug: true, featuredImage: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ offers, dealerId });
}

export async function POST(req: NextRequest) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session.user as any)?.id as string;
  const dealerId = await getSessionDealerId(userId);
  if (!dealerId) return NextResponse.json({ error: "No dealer linked to your account" }, { status: 400 });

  const body = await req.json();
  const {
    vehicleId,
    variantName,
    offerPrice,
    discount,
    discountType,
    priceDisplay,
    validFrom,
    validUntil,
    notes,
    isActive,
  } = body;

  if (!vehicleId) {
    return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });
  }

  try {
    const offer = await prisma.dealerVehicleOffer.create({
      data: {
        dealerId,
        vehicleId,
        variantName:  variantName  || null,
        offerPrice:   offerPrice  != null ? parseFloat(offerPrice)  : null,
        discount:     discount    != null ? parseFloat(discount)    : null,
        discountType: discountType || null,
        priceDisplay: priceDisplay || null,
        validFrom:    validFrom    ? new Date(validFrom)  : null,
        validUntil:   validUntil   ? new Date(validUntil) : null,
        notes:        notes        || null,
        isActive:     isActive !== undefined ? !!isActive : true,
      },
      include: {
        vehicle: { select: { id: true, name: true, slug: true, featuredImage: true } },
      },
    });
    return NextResponse.json(offer, { status: 201 });
  } catch (e: any) {
    console.error("[DEALER OFFER CREATE]", e);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
