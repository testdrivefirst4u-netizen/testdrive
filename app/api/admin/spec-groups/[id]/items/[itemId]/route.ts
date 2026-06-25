import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

type Ctx = { params: Promise<{ id: string; itemId: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId } = await params;
    const { name, unit, description, sortOrder } = await req.json();

    const item = await prisma.specItem.update({
      where: { id: itemId },
      data: {
        ...(name ? { name, slug: slugify(name) } : {}),
        unit: unit ?? undefined,
        description: description ?? undefined,
        sortOrder: sortOrder ?? undefined,
      },
    });
    return NextResponse.json(item);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { itemId } = await params;
    await prisma.specItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
