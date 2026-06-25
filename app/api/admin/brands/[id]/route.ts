import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { vehicles: true } }, seo: true },
    });
    if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(brand);
  } catch {
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { name, logo, logoFileId, description, country, founded, isPopular, status, sortOrder } = body;

    const slug = name ? slugify(name) : undefined;
    const brand = await prisma.brand.update({
      where: { id },
      data: { ...(name && { name, slug }), logo, logoFileId, description, country, founded: founded ? parseInt(founded) : null, isPopular: !!isPopular, status, sortOrder },
    });
    return NextResponse.json(brand);
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Brand name already taken" }, { status: 409 });
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
