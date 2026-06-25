import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, city, model, date } = body;

    if (!name || !phone || !model) {
      return NextResponse.json({ error: "Name, phone, and vehicle model are required." }, { status: 400 });
    }

    await prisma.lead.create({
      data: {
        name,
        mobile: phone,
        city: city || null,
        vehicleName: model,
        vehicleType: "CAR",
        buyTime: date || null,
        source: "test_drive",
        status: "new",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[TEST DRIVE API]", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
