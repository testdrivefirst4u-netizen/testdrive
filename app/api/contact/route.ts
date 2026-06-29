import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { assignDealer } from "@/lib/assign-dealer";
import { rateLimit } from "@/lib/rate-limit";
import { pushLeadToCrm, buildCrmPayload } from "@/lib/crm-push";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
    if (!rateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { name, email, phone, subject, message, city, brandId } = body;

    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Name, phone, and message are required." }, { status: 400 });
    }

    const mobileClean = String(phone).replace(/\D/g, "");
    if (mobileClean.length !== 10) {
      return NextResponse.json({ error: "Enter a valid 10-digit mobile number." }, { status: 400 });
    }

    // Dedup: same mobile + contact_form within 7 days → upsert
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const existing = await prisma.lead.findFirst({
      where: { mobile: mobileClean, source: "contact_form", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      select: { id: true, notes: true },
    });

    if (existing) {
      const appendedNotes = existing.notes
        ? `${existing.notes}\n---\n${message}`
        : message;
      const updated = await prisma.lead.update({
        where: { id: existing.id },
        data: {
          name,
          ...(email   && { email }),
          ...(city    && { city }),
          ...(subject && { vehicleName: subject }),
          notes:  appendedNotes,
          status: "new",
        },
      });
      pushLeadToCrm(updated.dealerId, buildCrmPayload(updated));
      return NextResponse.json({ success: true, updated: true });
    }

    const dealerId = await assignDealer(brandId, {
      name,
      mobile: mobileClean,
      vehicleName: subject,
      source: "contact_form",
    });

    const lead = await prisma.lead.create({
      data: {
        name,
        mobile:      mobileClean,
        email:       email   || null,
        city:        city    || null,
        vehicleName: subject || "General Enquiry",
        brandId:     brandId || null,
        dealerId:    dealerId || null,
        source:      "contact_form",
        notes:       message,
        status:      "new",
      },
    });
    pushLeadToCrm(dealerId, buildCrmPayload(lead));

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[CONTACT API]", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
