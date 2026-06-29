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
    if (mobileClean.length !== 10) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }

    // Dedup: same mobile + test_drive within 7 days → upsert
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existing = await prisma.lead.findFirst({
      where: { mobile: mobileClean, source: "test_drive", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (existing) {
      await prisma.lead.update({
        where: { id: existing.id },
        data: {
          name,
          vehicleName: model,
          ...(city && { city }),
          ...(date && { buyTime: date }),
          status: "new",
        },
      });
      return NextResponse.json({ success: true, updated: true });
    }

    const dealerId = await assignDealer(brandId, {
      name,
      mobile: mobileClean,
      vehicleName: model,
      source: "test_drive",
    });

    await prisma.lead.create({
      data: {
        name,
        mobile:      mobileClean,
        city:        city      || null,
        vehicleName: model,
        vehicleType: "CAR",
        buyTime:     date      || null,
        brandId:     brandId   || null,
        dealerId:    dealerId  || null,
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
