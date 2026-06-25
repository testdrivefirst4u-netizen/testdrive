import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: groupId } = await params;
    const { name, unit, description, sortOrder } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const item = await prisma.specItem.create({
      data: { groupId, name, slug: slugify(name), unit: unit || null, description: description || null, sortOrder: sortOrder || 0 },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
