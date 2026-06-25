import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const types = searchParams.get("types") || ""; // comma-separated
    const brand = searchParams.get("brand") || "";
    const bodyType = searchParams.get("bodyType") || "";
    const priceMinLakh = parseFloat(searchParams.get("priceMin") || "0");
    const priceMaxLakh = parseFloat(searchParams.get("priceMax") || "9999");
    const fuel = searchParams.get("fuel") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const featured = searchParams.get("featured") === "true";
    const electricOnly = searchParams.get("electric") === "true";
    const availability = searchParams.get("availability") || "";
    const upcoming = searchParams.get("upcoming") === "true";

    const where: any = { status: "PUBLISHED" };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search, mode: "insensitive" } } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ];
    }
    if (types) {
      where.type = { in: types.split(",").map((t) => t.trim()).filter(Boolean) };
    } else if (type) {
      where.type = type;
    }
    if (brand) where.brand = { slug: brand };
    if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
    if (featured) where.featured = true;
    if (electricOnly) where.isElectric = true;
    if (upcoming) where.isUpcoming = true;
    if (availability) where.availabilityStatus = availability;

    // Only apply price filter when the user has explicitly set a range
    if (searchParams.has("priceMin") || searchParams.has("priceMax")) {
      const conditions: any[] = [];
      if (priceMinLakh > 0) conditions.push({ priceMin: { gte: priceMinLakh } });
      if (priceMaxLakh < 9999) conditions.push({ priceMin: { lte: priceMaxLakh } });
      if (conditions.length) where.AND = conditions;
    }

    if (fuel) where.variants = { some: { fuelType: { equals: fuel, mode: "insensitive" } } };

    const orderBy: any =
      sortBy === "price-low" ? { priceMin: "asc" } :
      sortBy === "price-high" ? { priceMin: "desc" } :
      sortBy === "popularity" ? { viewCount: "desc" } :
      sortBy === "featured" ? [{ featured: "desc" }, { createdAt: "desc" }] :
      { createdAt: "desc" };

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          brand: { select: { name: true, slug: true, logo: true } },
          category: { select: { name: true, slug: true } },
          images: { where: { sortOrder: 0 }, take: 1 },
          variants: {
            where: { isDefault: true },
            take: 1,
            select: { fuelType: true, transmission: true, mileage: true, range: true, priceDisplay: true },
          },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json(
      { vehicles, total, page, pages: Math.ceil(total / limit) },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}
