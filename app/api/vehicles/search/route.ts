import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "10"), 30);

  if (q.length < 2) {
    return NextResponse.json({ vehicles: [] });
  }

  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { name: { contains: q, mode: "insensitive" } } },
        { slug: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      featuredImage: true,
      brand: { select: { name: true } },
    },
    orderBy: { name: "asc" },
    take: limit,
  });

  return NextResponse.json({
    vehicles: vehicles.map((v) => ({
      id: v.id,
      name: `${v.brand.name} ${v.name}`,
      slug: v.slug,
      featuredImage: v.featuredImage,
    })),
  });
}
