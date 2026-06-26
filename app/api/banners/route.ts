import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const revalidate = 60; // cache 60s

export async function GET(req: NextRequest) {
  const position = new URL(req.url).searchParams.get("position") ?? "";
  const where: any = { isActive: true };
  if (position) where.position = position;

  const banners = await prisma.banner.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    select: {
      id: true, title: true, subtitle: true, imageUrl: true,
      linkUrl: true, linkLabel: true, position: true, sortOrder: true,
    },
  });

  return NextResponse.json({ banners }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}
