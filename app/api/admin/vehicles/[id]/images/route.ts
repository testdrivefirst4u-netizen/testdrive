import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const images = await prisma.vehicleImage.findMany({
    where: { vehicleId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(images);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { url, fileId, alt, caption, type, sortOrder } = body;

  const image = await prisma.vehicleImage.create({
    data: { vehicleId: id, url, fileId, alt, caption, type: type || "gallery", sortOrder: sortOrder || 0 },
  });
  return NextResponse.json(image, { status: 201 });
}

// Bulk replace all gallery images (used on save — both create and edit)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { images } = await req.json();

    await prisma.vehicleImage.deleteMany({ where: { vehicleId: id } });

    if (images?.length) {
      await prisma.vehicleImage.createMany({
        data: images.map((img: any, i: number) => ({
          vehicleId: id,
          url: img.url,
          fileId: img.fileId || null,
          alt: img.alt || null,
          type: img.type || "gallery",
          sortOrder: i,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to sync images" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const imageId = searchParams.get("imageId");
  if (!imageId) return NextResponse.json({ error: "imageId required" }, { status: 400 });

  await prisma.vehicleImage.delete({ where: { id: imageId } });
  return NextResponse.json({ success: true });
}
