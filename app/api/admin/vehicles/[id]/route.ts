import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Save SEO for a vehicle without hitting the unique-null conflict on brandId/newsId/blogId.
// Prisma's create() writes null for every unset nullable field, and MongoDB unique indexes
// treat null as a concrete value — only ONE document can have brandId=null.
// Fix: use Prisma update when record exists (safe), and $runCommandRaw when it doesn't
// (MongoDB native upsert only stores fields you explicitly provide).
async function saveSeo(vehicleId: string, seo: Record<string, any>) {
  const fields: Record<string, string> = {};
  for (const k of ["metaTitle", "metaDescription", "metaKeywords", "canonicalUrl", "ogTitle", "ogDescription", "ogImage"]) {
    if (seo[k]) fields[k] = seo[k];
  }
  if (!Object.keys(fields).length) return;

  try {
    const existing = await prisma.seo.findUnique({ where: { vehicleId } });
    if (existing) {
      // Safe Prisma update — only touches the fields we supply; brandId/newsId/blogId untouched
      await prisma.seo.update({ where: { id: existing.id }, data: fields });
      return;
    }

    // No existing record: use raw MongoDB so only vehicleId + seo fields are written.
    // Prisma's create() writes null for every unset nullable field, and MongoDB unique
    // indexes treat null as a value — only one document can have brandId=null.
    const nowMs = Date.now().toString();
    await prisma.$runCommandRaw({
      update: "seo",
      updates: [{
        q: { vehicleId: { $oid: vehicleId } },
        u: {
          $set: { ...fields, updatedAt: { $date: { $numberLong: nowMs } } },
          $setOnInsert: {
            vehicleId: { $oid: vehicleId },
            createdAt: { $date: { $numberLong: nowMs } },
          },
        },
        upsert: true,
      }],
    });
  } catch (e) {
    // SEO save failing should not block the vehicle save
    console.error("SEO save error:", e);
  }
}

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
      await saveSeo(id, seo);
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

    // Delete relations that don't cascade (onDelete: NoAction in schema)
    await Promise.all([
      prisma.seo.deleteMany({ where: { vehicleId: id } }),
      prisma.faq.deleteMany({ where: { vehicleId: id } }),
      prisma.media.deleteMany({ where: { vehicleId: id } }),
    ]);

    // variants, images, colours, specGroups → specValues, features all cascade
    await prisma.vehicle.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Vehicle delete error:", e);
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}
