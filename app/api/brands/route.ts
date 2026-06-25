import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const popular = searchParams.get("popular") === "true";

    const where: any = { status: "PUBLISHED" };
    if (popular) where.isPopular = true;

    const brands = await prisma.brand.findMany({
      where,
      take: limit,
      orderBy: [{ isPopular: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true, name: true, slug: true, logo: true, isPopular: true,
        _count: { select: { vehicles: { where: { status: "PUBLISHED" } } } },
      },
    });

    return NextResponse.json(
      { brands },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}
