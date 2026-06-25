import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

type Ctx = { params: Promise<{ id: string; variantId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { variantId } = await params;
    const body = await req.json();
    const { name, priceMin, priceMax, priceDisplay, fuelType, transmission, engine, power, torque, mileage, range, isDefault, status, sortOrder, specs, features } = body;

    const variant = await prisma.variant.update({
      where: { id: variantId },
      data: {
        ...(name ? { name, slug: slugify(name) } : {}),
        priceMin:    priceMin  != null ? parseFloat(priceMin)  : null,
        priceMax:    priceMax  != null ? parseFloat(priceMax)  : null,
        priceDisplay: priceDisplay ?? undefined,
        fuelType:    fuelType    ?? undefined,
        transmission:transmission ?? undefined,
        engine:      engine      ?? undefined,
        power:       power       ?? undefined,
        torque:      torque      ?? undefined,
        mileage:     mileage     ?? undefined,
        range:       range       ?? undefined,
        isDefault:   isDefault   != null ? !!isDefault : undefined,
        status:      status      ?? undefined,
        sortOrder:   sortOrder   != null ? +sortOrder  : undefined,
        specs, features,
      },
    });
    return NextResponse.json(variant);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { variantId } = await params;
    await prisma.variant.delete({ where: { id: variantId } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
