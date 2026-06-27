import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const colours = await prisma.vehicleColour.findMany({
    where: { vehicleId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(colours);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { name, hexCode, imageUrl, fileId, sortOrder } = body;

  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const colour = await prisma.vehicleColour.create({
    data: { vehicleId: id, name, hexCode, imageUrl, fileId, sortOrder: sortOrder || 0 },
  });
  return NextResponse.json(colour, { status: 201 });
}

// Bulk replace all colours (used on save — both create and edit)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { colours } = await req.json();

    await prisma.vehicleColour.deleteMany({ where: { vehicleId: id } });

    if (colours?.length) {
      await prisma.vehicleColour.createMany({
        data: colours.map((c: any, i: number) => ({
          vehicleId: id,
          name: c.name,
          hexCode: c.hexCode || null,
          imageUrl: c.imageUrl || null,
          fileId: c.fileId || null,
          sortOrder: i,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to sync colours" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const colourId = searchParams.get("colourId");
  if (!colourId) return NextResponse.json({ error: "colourId required" }, { status: 400 });

  await prisma.vehicleColour.delete({ where: { id: colourId } });
  return NextResponse.json({ success: true });
}
