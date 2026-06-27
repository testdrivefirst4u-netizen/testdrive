import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(role ?? "")) return null;
  return session;
}

type Ctx = { params: Promise<{ offerId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { offerId } = await params;
  const body = await req.json();
  const {
    dealerId,
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
        ...(dealerId     !== undefined ? { dealerId }                                         : {}),
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
        dealer: { select: { id: true, name: true, city: true, phone: true } },
      },
    });
    return NextResponse.json(offer);
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    console.error("[DEALER OFFER UPDATE]", e);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { offerId } = await params;
  try {
    await prisma.dealerVehicleOffer.delete({ where: { id: offerId } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    console.error("[DEALER OFFER DELETE]", e);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
