import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      include: {
        brand: { select: { name: true, slug: true, logo: true } },
        category: { select: { name: true, slug: true, type: true } },
        variants: { where: { status: "PUBLISHED" }, orderBy: { sortOrder: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        colours: { orderBy: { sortOrder: "asc" } },
        specGroups: {
          include: {
            group: true,
            specValues: { include: { specItem: true }, orderBy: { specItem: { sortOrder: "asc" } } },
          },
          orderBy: { group: { sortOrder: "asc" } },
        },
        features: { orderBy: { sortOrder: "asc" } },
        faqs: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        seo: true,
      },
    });

    if (!vehicle || vehicle.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    prisma.vehicle.update({ where: { slug }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    const similar = await prisma.vehicle.findMany({
      where: { brandId: vehicle.brandId, status: "PUBLISHED", id: { not: vehicle.id } },
      take: 6,
      include: {
        brand: { select: { name: true, slug: true } },
        images: { where: { sortOrder: 0 }, take: 1 },
      },
    });

    return NextResponse.json({ vehicle, similar });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 });
  }
}
