import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        variants: { orderBy: { sortOrder: "asc" } },
        images: { orderBy: { sortOrder: "asc" } },
        colours: { orderBy: { sortOrder: "asc" } },
        specGroups: { include: { group: true, specValues: { include: { specItem: true } } } },
        features: { orderBy: { sortOrder: "asc" } },
        faqs: { orderBy: { sortOrder: "asc" } },
        seo: true,
      },
    });
    if (!vehicle) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(vehicle);
  } catch {
    return NextResponse.json({ error: "Failed to fetch vehicle" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
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

    const seo = body.seo;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        name, brandId, categoryId, type,
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
        status, sortOrder,
      },
    });

    if (seo) {
      await prisma.seo.upsert({
        where: { vehicleId: id },
        create: { vehicleId: id, ...seo },
        update: seo,
      });
    }

    return NextResponse.json(vehicle);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const vehicle = await prisma.vehicle.update({ where: { id }, data: body });
    return NextResponse.json(vehicle);
  } catch (e) {
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.vehicle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
