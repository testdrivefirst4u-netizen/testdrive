import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { assignDealer } from "@/lib/assign-dealer";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    if (!rateLimit(`test-drive:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { name, phone, city, model, date, brandId } = body;

    if (!name || !phone || !model) {
      return NextResponse.json({ error: "Name, phone, and vehicle model are required." }, { status: 400 });
    }

    const mobileClean = String(phone).replace(/\D/g, "");

    // Prevent duplicate leads: same mobile within 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await prisma.lead.findFirst({
      where: { mobile: mobileClean, source: "test_drive", createdAt: { gte: since } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    const dealerId = await assignDealer(brandId, { name, mobile: mobileClean, vehicleName: model, source: "test_drive" });

    await prisma.lead.create({
      data: {
        name,
        mobile:      mobileClean,
        city:        city     || null,
        vehicleName: model,
        vehicleType: "CAR",
        buyTime:     date     || null,
        brandId:     brandId  || null,
        dealerId:    dealerId || null,
        source:      "test_drive",
        status:      "new",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[TEST DRIVE API]", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
