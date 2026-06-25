import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message, city } = body;

    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Name, phone, and message are required." }, { status: 400 });
    }

    await prisma.lead.create({
      data: {
        name,
        mobile: phone,
        email: email || null,
        city: city || null,
        vehicleName: subject || "General Enquiry",
        source: "contact_form",
        notes: message,
        status: "new",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[CONTACT API]", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
