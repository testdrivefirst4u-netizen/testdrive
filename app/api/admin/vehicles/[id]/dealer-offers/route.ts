import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(role ?? "")) return null;
  return session;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const offers = await prisma.dealerVehicleOffer.findMany({
    where: { vehicleId: id },
    include: {
      dealer: { select: { id: true, name: true, city: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(offers);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
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

  if (!dealerId) {
    return NextResponse.json({ error: "dealerId is required" }, { status: 400 });
  }

  try {
    const offer = await prisma.dealerVehicleOffer.create({
      data: {
        dealerId,
        vehicleId: id,
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
        dealer: { select: { id: true, name: true, city: true, phone: true } },
      },
    });
    return NextResponse.json(offer, { status: 201 });
  } catch (e: any) {
    console.error("[DEALER OFFER CREATE]", e);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
