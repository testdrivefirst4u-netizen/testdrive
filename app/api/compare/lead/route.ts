import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { assignDealer } from "@/lib/assign-dealer";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    if (!rateLimit(`compare-lead:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests." }, { status: 429 });
    }

    const body = await req.json();
    const { name, phone, city, vehicleName, brandName, brandId, source, intent } = body;

    if (!name || !phone || !vehicleName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const mobileClean = String(phone).replace(/\D/g, "");
    if (mobileClean.length !== 10) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }

    const notesArr: string[] = [];
    if (brandName) notesArr.push(`Brand: ${brandName}`);
    if (intent)    notesArr.push(`Intent: ${intent}`);
    const notes = notesArr.join(" | ") || null;

    // Dedup: same mobile + compare source within 7 days → upsert
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existing = await prisma.lead.findFirst({
      where: { mobile: mobileClean, source: source || "compare", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (existing) {
      await prisma.lead.update({
        where: { id: existing.id },
        data: {
          name:        name.trim(),
          vehicleName,
          ...(city  && { city }),
          ...(notes && { notes }),
          status: "new",
        },
      });
      return NextResponse.json({ success: true, updated: true });
    }

    const dealerId = await assignDealer(brandId);

    await prisma.lead.create({
      data: {
        name:        name.trim(),
        mobile:      mobileClean,
        city:        city      || null,
        vehicleName,
        brandId:     brandId   || null,
        dealerId:    dealerId  || null,
        source:      source    || "compare",
        notes,
        status:      "new",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[COMPARE LEAD] Error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
