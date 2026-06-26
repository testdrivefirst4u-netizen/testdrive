import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { assignDealer } from "@/lib/assign-dealer";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    if (!rateLimit(`form:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { name, mobile, city, carName, buyTime, sellCar, vehicleType, brandId } = body;

    if (!name || !mobile) {
      return NextResponse.json({ error: "Name and mobile are required." }, { status: 400 });
    }

    const mobileClean = String(mobile).replace(/\D/g, "");
    if (mobileClean.length !== 10) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }

    // Prevent duplicate leads: same mobile within 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await prisma.lead.findFirst({
      where: { mobile: mobileClean, createdAt: { gte: since } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    const dealerId = await assignDealer(brandId, { name, mobile: mobileClean, vehicleName: carName, source: "offer_popup" });

    await prisma.lead.create({
      data: {
        name:        name.trim(),
        mobile:      mobileClean,
        city:        city && city !== "Detecting location..." && city !== "Location unavailable" ? city.trim() : null,
        vehicleName: carName     || null,
        vehicleType: vehicleType ? String(vehicleType).toUpperCase() : null,
        buyTime:     buyTime     || null,
        sellCar:     sellCar     || null,
        brandId:     brandId     || null,
        dealerId:    dealerId    || null,
        source:      "offer_popup",
        status:      "new",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[FORM API]", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
