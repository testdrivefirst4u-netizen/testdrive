import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const variants = await prisma.variant.findMany({
    where: { vehicleId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(variants);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, priceMin, priceMax, priceDisplay, fuelType, transmission, engine, power, torque, mileage, range, isDefault, status, sortOrder, specs, features } = body;

  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const slug = slugify(name);
  const variant = await prisma.variant.create({
    data: {
      vehicleId: id, name, slug,
      priceMin: priceMin ? parseFloat(priceMin) : null,
      priceMax: priceMax ? parseFloat(priceMax) : null,
      priceDisplay, fuelType, transmission, engine, power, torque, mileage, range,
      isDefault: !!isDefault, status: status || "PUBLISHED", sortOrder: sortOrder || 0, specs, features,
    },
  });
  return NextResponse.json(variant, { status: 201 });
}

// Bulk replace all variants (used on save — both create and edit)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { variants } = await req.json();

    await prisma.variant.deleteMany({ where: { vehicleId: id } });

    if (variants?.length) {
      await prisma.variant.createMany({
        data: variants.map((v: any, i: number) => ({
          vehicleId: id,
          name: v.name,
          slug: slugify(v.name) || `variant-${i + 1}`,
          priceDisplay: v.priceDisplay || null,
          fuelType: v.fuelType || null,
          transmission: v.transmission || null,
          mileage: v.mileage || null,
          range: v.range || null,
          engine: v.engine || null,
          power: v.power || null,
          torque: v.torque || null,
          isDefault: i === 0,
          status: "PUBLISHED",
          sortOrder: i,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to sync variants" }, { status: 500 });
  }
}
