import { NextRequest, NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";

type Ctx = { params: Promise<{ offerId: string }> };

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

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session.user as any)?.id as string;
  const dealerId = await getSessionDealerId(userId);
  if (!dealerId) return NextResponse.json({ error: "No dealer linked to your account" }, { status: 400 });

  const { offerId } = await params;

  // Verify the offer belongs to this dealer
  const existing = await prisma.dealerVehicleOffer.findUnique({ where: { id: offerId } });
  if (!existing) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  if (existing.dealerId !== dealerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const {
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

  try {
    const offer = await prisma.dealerVehicleOffer.update({
      where: { id: offerId },
      data: {
        ...(variantName  !== undefined ? { variantName:  variantName  || null }               : {}),
        ...(offerPrice   !== undefined ? { offerPrice:   offerPrice != null ? parseFloat(offerPrice) : null } : {}),
        ...(discount     !== undefined ? { discount:     discount   != null ? parseFloat(discount)   : null } : {}),
        ...(discountType !== undefined ? { discountType: discountType || null }               : {}),
        ...(priceDisplay !== undefined ? { priceDisplay: priceDisplay || null }               : {}),
        ...(validFrom    !== undefined ? { validFrom:    validFrom  ? new Date(validFrom)  : null } : {}),
        ...(validUntil   !== undefined ? { validUntil:   validUntil ? new Date(validUntil) : null } : {}),
        ...(notes        !== undefined ? { notes:        notes || null }                      : {}),
        ...(isActive     !== undefined ? { isActive:     !!isActive }                         : {}),
      },
      include: {
        vehicle: { select: { id: true, name: true, slug: true, featuredImage: true } },
      },
    });
    return NextResponse.json(offer);
  } catch (e: any) {
    console.error("[DEALER OFFER UPDATE]", e);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session.user as any)?.id as string;
  const dealerId = await getSessionDealerId(userId);
  if (!dealerId) return NextResponse.json({ error: "No dealer linked to your account" }, { status: 400 });

  const { offerId } = await params;

  // Verify the offer belongs to this dealer
  const existing = await prisma.dealerVehicleOffer.findUnique({ where: { id: offerId } });
  if (!existing) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
  if (existing.dealerId !== dealerId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.dealerVehicleOffer.delete({ where: { id: offerId } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[DEALER OFFER DELETE]", e);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
