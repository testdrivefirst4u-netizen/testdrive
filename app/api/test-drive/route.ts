import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { assignDealer } from "@/lib/assign-dealer";
import { rateLimit } from "@/lib/rate-limit";
import { pushLeadToCrm, buildCrmPayload } from "@/lib/crm-push";
import { notifyDealerTestDriveBooked } from "@/lib/notify";

async function upsertVisit(leadId: string, dealerId: string, vehicleName: string, date?: string, time?: string) {
  const scheduledAt = date ? new Date(`${date}T${time || "10:00"}:00`) : null;
  await prisma.testDriveVisit.upsert({
    where: { leadId },
    update: { dealerId, vehicleName, scheduledAt: scheduledAt ?? undefined, status: "SCHEDULED" },
    create: { leadId, dealerId, vehicleName, scheduledAt },
  });
}

async function notifyDealerOfBooking(dealerId: string, params: {
  name: string; mobileClean: string; model: string;
  date?: string; time?: string; address?: string; city?: string;
  lat?: number; lon?: number;
}) {
  const dealer = await prisma.dealer.findUnique({ where: { id: dealerId }, select: { email: true, name: true } });
  if (!dealer) return;
  notifyDealerTestDriveBooked({
    dealerEmail: dealer.email,
    dealerName: dealer.name,
    leadName: params.name,
    leadMobile: params.mobileClean,
    vehicleName: params.model,
    scheduledDate: params.date || null,
    scheduledTime: params.time || null,
    address: params.address || params.city || null,
    latitude: params.lat ?? null,
    longitude: params.lon ?? null,
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    if (!rateLimit(`test-drive:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { name, phone, city, model, date, time, brandId, latitude, longitude, address } = body;

    if (!name || !phone || !model) {
      return NextResponse.json({ error: "Name, phone, and vehicle model are required." }, { status: 400 });
    }

    const mobileClean = String(phone).replace(/\D/g, "");
    if (mobileClean.length !== 10) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }

    const lat = typeof latitude === "number" ? latitude : undefined;
    const lon = typeof longitude === "number" ? longitude : undefined;

    // Dedup: same mobile + test_drive within 7 days → upsert
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existing = await prisma.lead.findFirst({
      where: { mobile: mobileClean, source: "test_drive", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (existing) {
      const updated = await prisma.lead.update({
        where: { id: existing.id },
        data: {
          name,
          vehicleName: model,
          ...(city && { city }),
          ...(date && { buyTime: date }),
          ...(time && { preferredTime: time }),
          ...(lat !== undefined && { latitude: lat }),
          ...(lon !== undefined && { longitude: lon }),
          ...(address && { address }),
          status: "new",
        },
      });
      pushLeadToCrm(updated.dealerId, buildCrmPayload(updated));

      if (updated.dealerId) {
        await upsertVisit(updated.id, updated.dealerId, model, date, time);
        await notifyDealerOfBooking(updated.dealerId, { name, mobileClean, model, date, time, address, city, lat, lon });
      }

      return NextResponse.json({ success: true, updated: true });
    }

    const dealerId = await assignDealer(brandId);

    const lead = await prisma.lead.create({
      data: {
        name,
        mobile:        mobileClean,
        city:          city      || null,
        vehicleName:   model,
        vehicleType:   "CAR",
        buyTime:       date      || null,
        preferredTime: time      || null,
        latitude:      lat,
        longitude:     lon,
        address:       address   || null,
        brandId:       brandId   || null,
        dealerId:      dealerId  || null,
        source:        "test_drive",
        status:        "new",
      },
    });
    pushLeadToCrm(dealerId, buildCrmPayload(lead));

    if (dealerId) {
      await upsertVisit(lead.id, dealerId, model, date, time);
      await notifyDealerOfBooking(dealerId, { name, mobileClean, model, date, time, address, city, lat, lon });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[TEST DRIVE API]", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
