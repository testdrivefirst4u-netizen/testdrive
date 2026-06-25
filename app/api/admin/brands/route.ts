import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};
    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { vehicles: true } } },
      }),
      prisma.brand.count({ where }),
    ]);

    return NextResponse.json({ brands, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, logo, logoFileId, description, country, founded, isPopular, status, sortOrder } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const slug = slugify(name);
    const brand = await prisma.brand.create({
      data: { name, slug, logo, logoFileId, description, country, founded: founded ? parseInt(founded) : null, isPopular: !!isPopular, status: status || "PUBLISHED", sortOrder: sortOrder || 0 },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Brand already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 });
  }
}
