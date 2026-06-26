import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { assignDealer } from "@/lib/assign-dealer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, city, vehicleName, brandName, brandId, source, intent } = body;

    if (!name || !phone || !vehicleName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dealerId = await assignDealer(brandId);

    const notesArr: string[] = [];
    if (brandName) notesArr.push(`Brand: ${brandName}`);
    if (intent)    notesArr.push(`Intent: ${intent}`);

    await prisma.lead.create({
      data: {
        name:        name.trim(),
        mobile:      String(phone).trim(),
        city:        city        || null,
        vehicleName: vehicleName,
        brandId:     brandId     || null,
        dealerId:    dealerId    || null,
        source:      source      || "compare",
        notes:       notesArr.length ? notesArr.join(" | ") : null,
        status:      "new",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[COMPARE LEAD] Error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
