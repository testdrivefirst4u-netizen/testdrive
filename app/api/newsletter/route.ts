import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    // Store as a lead with newsletter source
    await prisma.lead.create({
      data: {
        name: "Newsletter Subscriber",
        mobile: "0000000000",
        email,
        source: "newsletter",
        vehicleName: "Newsletter",
        status: "new",
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[NEWSLETTER API]", e);
    // Don't expose DB errors to the client — still return success to avoid leaking info
    return NextResponse.json({ success: true });
  }
}
