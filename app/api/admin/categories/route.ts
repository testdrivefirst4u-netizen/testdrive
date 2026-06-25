import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const categories = await prisma.category.findMany({
      where: type ? { type: type as any } : {},
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { vehicles: true } } },
    });
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, type, description, icon, image, isActive, sortOrder } = body;

    if (!name || !type) return NextResponse.json({ error: "Name and type are required" }, { status: 400 });

    const slug = slugify(name);
    const category = await prisma.category.create({
      data: { name, slug, type, description, icon, image, isActive: isActive !== false, sortOrder: sortOrder || 0 },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
