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
