import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { assignDealer } from "@/lib/assign-dealer";
import { rateLimit } from "@/lib/rate-limit";
import { pushLeadToCrm, buildCrmPayload } from "@/lib/crm-push";
import { notifyDealerTestDriveBooked } from "@/lib/notify";
import { sendPushToUser } from "@/lib/push";

// Picks a driver from the dealer's team who has no other trip scheduled within
// 1 hour of the requested slot — so a driver is never double-booked for the same time.
// Among the drivers who are free, the one with the fewest trips that day gets it,
// so bookings spread out evenly instead of always landing on the same driver.
async function findAvailableDriver(dealerId: string, scheduledAt: Date | null): Promise<string | null> {
  if (!scheduledAt) return null;

  const drivers = await prisma.user.findMany({
    where: { dealerId, role: "DRIVER", isActive: true },
    select: { id: true },
  });
  if (!drivers.length) return null;

  const bufferMs = 60 * 60 * 1000; // 1 hour conflict window either side
  const windowStart = new Date(scheduledAt.getTime() - bufferMs);
  const windowEnd = new Date(scheduledAt.getTime() + bufferMs);

  const conflicting = await prisma.testDriveVisit.findMany({
    where: {
      assignedDriverId: { in: drivers.map((d) => d.id) },
      status: { in: ["SCHEDULED", "EN_ROUTE", "ARRIVED"] },
      scheduledAt: { gte: windowStart, lte: windowEnd },
    },
    select: { assignedDriverId: true },
  });
  const busyIds = new Set(conflicting.map((c) => c.assignedDriverId));
  const freeDrivers = drivers.filter((d) => !busyIds.has(d.id));

  if (freeDrivers.length <= 1) return freeDrivers[0]?.id ?? null;

  const dayStart = new Date(scheduledAt); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(scheduledAt); dayEnd.setHours(23, 59, 59, 999);

  const dayTrips = await prisma.testDriveVisit.findMany({
    where: {
      assignedDriverId: { in: freeDrivers.map((d) => d.id) },
      status: { in: ["SCHEDULED", "EN_ROUTE", "ARRIVED", "COMPLETED"] },
      scheduledAt: { gte: dayStart, lte: dayEnd },
    },
    select: { assignedDriverId: true },
  });

  const loadCount = new Map<string, number>(freeDrivers.map((d) => [d.id, 0]));
  for (const t of dayTrips) {
    loadCount.set(t.assignedDriverId!, (loadCount.get(t.assignedDriverId!) ?? 0) + 1);
  }

  return freeDrivers.reduce((least, d) =>
    (loadCount.get(d.id) ?? 0) < (loadCount.get(least.id) ?? 0) ? d : least
  ).id;
}

async function upsertVisit(leadId: string, dealerId: string, vehicleName: string, customerName: string, date?: string, time?: string) {
  const scheduledAt = date ? new Date(`${date}T${time || "10:00"}:00`) : null;

  const existing = await prisma.testDriveVisit.findUnique({
    where: { leadId },
    select: { assignedDriverId: true },
  });

  // Only auto-assign if nobody is already manually assigned to this booking
  const autoDriverId = existing?.assignedDriverId ? null : await findAvailableDriver(dealerId, scheduledAt);

  await prisma.testDriveVisit.upsert({
    where: { leadId },
    update: {
      dealerId, vehicleName, scheduledAt: scheduledAt ?? undefined, status: "SCHEDULED",
      ...(autoDriverId && { assignedDriverId: autoDriverId }),
    },
    create: { leadId, dealerId, vehicleName, scheduledAt, assignedDriverId: autoDriverId },
  });

  if (autoDriverId) {
    sendPushToUser(autoDriverId, {
      title: "New Test Drive Assigned",
      body: `${vehicleName} for ${customerName}${time ? ` at ${time}` : ""}`,
      url: "/driver/dashboard",
    }).catch(() => {});
  }
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
        await upsertVisit(updated.id, updated.dealerId, model, name, date, time);
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
      await upsertVisit(lead.id, dealerId, model, name, date, time);
      await notifyDealerOfBooking(dealerId, { name, mobileClean, model, date, time, address, city, lat, lon });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[TEST DRIVE API]", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
