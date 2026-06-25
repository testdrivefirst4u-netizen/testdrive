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
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const brandId = searchParams.get("brandId") || "";

    const where: any = {};
    if (search) where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
      { brand: { name: { contains: search, mode: "insensitive" } } },
    ];
    if (status) where.status = status;
    if (type) where.type = type;
    if (brandId) where.brandId = brandId;

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          brand: { select: { name: true, logo: true } },
          category: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          _count: { select: { variants: true, images: true } },
        },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return NextResponse.json({ vehicles, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      name, brandId, categoryId, type, description, shortDescription,
      priceMin, priceMax, priceDisplay, exShowroomPrice, onRoadPrice,
      launchDate, isUpcoming, isPopular, isElectric, isNew,
      featured, availabilityStatus,
      featuredImage, featuredFileId,
      batteryCapacity, chargingTime, fastCharging, range, motorPower, motorTorque,
      acChargingTime, dcChargingTime, chargingPortType,
      bodyType, segment, mileage, topSpeed, engine, power, torque,
      acceleration, drivetrainType, seatingCapacity,
      overview, keyHighlights, pros, cons, brochureUrl, brochureFileId, videoUrl,
      vehicleWarranty, batteryWarranty,
      status, sortOrder,
    } = body;

    if (!name || !brandId || !categoryId || !type) {
      return NextResponse.json({ error: "Name, brand, category and type are required" }, { status: 400 });
    }

    // Slug: use provided slug or auto-generate from name
    const rawSlug = body.slug ? slugify(body.slug) : slugify(name);
    let slug = rawSlug;
    let counter = 1;
    while (await prisma.vehicle.findUnique({ where: { slug } })) {
      slug = `${rawSlug}-${counter++}`;
    }

    const seo = body.seo;

    const vehicle = await prisma.vehicle.create({
      data: {
        name, slug, brandId, categoryId, type,
        description, shortDescription,
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        priceDisplay,
        exShowroomPrice: exShowroomPrice ? parseFloat(exShowroomPrice) : null,
        onRoadPrice: onRoadPrice ? parseFloat(onRoadPrice) : null,
        launchDate: launchDate ? new Date(launchDate) : null,
        isUpcoming: !!isUpcoming, isPopular: !!isPopular, isElectric: !!isElectric, isNew: !!isNew,
        featured: !!featured,
        availabilityStatus: availabilityStatus || "available",
        featuredImage: featuredImage || null,
        featuredFileId: featuredFileId || null,
        batteryCapacity, chargingTime, fastCharging: !!fastCharging, range, motorPower, motorTorque,
        acChargingTime, dcChargingTime, chargingPortType,
        bodyType, segment, mileage, topSpeed, engine, power, torque,
        acceleration, drivetrainType,
        seatingCapacity: seatingCapacity ? parseInt(seatingCapacity) : null,
        overview, keyHighlights, pros, cons,
        brochureUrl, brochureFileId, videoUrl,
        vehicleWarranty, batteryWarranty,
        status: status || "DRAFT",
        sortOrder: sortOrder || 0,
      },
      include: { brand: { select: { name: true } }, category: { select: { name: true } } },
    });

    if (seo && Object.values(seo).some(Boolean)) {
      await prisma.seo.create({ data: { vehicleId: vehicle.id, ...seo } });
    }

    return NextResponse.json(vehicle, { status: 201 });
  } catch (e: any) {
    console.error(e);
    if (e.code === "P2002") return NextResponse.json({ error: "Vehicle with this slug already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}
