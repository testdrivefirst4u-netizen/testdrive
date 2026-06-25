import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const features = await prisma.vehicleFeature.findMany({
    where: { vehicleId: id },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(features);
}

// Bulk sync: replaces all features for a given category
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { features, category } = await req.json();

    // Delete existing features for this vehicle + category (or all if no category specified)
    await prisma.vehicleFeature.deleteMany({
      where: { vehicleId: id, ...(category ? { category } : {}) },
    });

    if (features?.length) {
      await prisma.vehicleFeature.createMany({
        data: features.map((f: any, i: number) => ({
          vehicleId: id,
          category: f.category || category || "features",
          name: f.name,
          available: f.available !== false,
          note: f.note || null,
          sortOrder: i,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to sync features" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const count = await prisma.vehicleFeature.count({ where: { vehicleId: id, category: body.category } });
    const feature = await prisma.vehicleFeature.create({
      data: { vehicleId: id, ...body, sortOrder: count },
    });
    return NextResponse.json(feature, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create feature" }, { status: 500 });
  }
}
