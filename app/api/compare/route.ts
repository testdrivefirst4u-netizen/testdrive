import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const HEADERS = { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slugsParam = searchParams.get("slugs") || "";
  const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4);

  if (slugs.length < 1) {
    return NextResponse.json({ error: "Provide at least one slug" }, { status: 400 });
  }

  try {
    const vehicles = await Promise.all(
      slugs.map((slug) =>
        prisma.vehicle.findUnique({
          where: { slug, status: "PUBLISHED" },
          include: {
            brand: { select: { name: true, slug: true, logo: true } },
            category: { select: { name: true, slug: true } },
            variants: { where: { status: "PUBLISHED" }, orderBy: { sortOrder: "asc" } },
            images: { orderBy: { sortOrder: "asc" }, take: 3 },
            specGroups: {
              include: {
                group: true,
                specValues: {
                  include: { specItem: true },
                  orderBy: { specItem: { sortOrder: "asc" } },
                },
              },
              orderBy: { group: { sortOrder: "asc" } },
            },
            features: { orderBy: { sortOrder: "asc" } },
          },
        })
      )
    );

    const found = vehicles.filter((v): v is NonNullable<typeof v> => !!v);

    // Fetch popular vehicles of the same type for "also compare" section
    const primaryType = found[0]?.type;
    const related = primaryType
      ? await prisma.vehicle.findMany({
          where: {
            status: "PUBLISHED",
            type: primaryType,
            id: { notIn: found.map((v) => v.id) },
          },
          take: 8,
          orderBy: [{ isPopular: "desc" }, { viewCount: "desc" }],
          select: {
            id: true, name: true, slug: true, type: true,
            priceDisplay: true, priceMin: true,
            brand: { select: { name: true, slug: true } },
            images: { take: 1, orderBy: { sortOrder: "asc" } },
          },
        })
      : [];

    return NextResponse.json({ vehicles: found, related }, { headers: HEADERS });
  } catch (e) {
    console.error("[compare] ", e);
    return NextResponse.json({ error: "Failed to fetch comparison data" }, { status: 500 });
  }
}
