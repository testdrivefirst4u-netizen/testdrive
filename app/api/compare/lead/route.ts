import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, city, vehicleName, vehicleSlug, brandName, source, intent } = body;

    if (!name || !phone || !vehicleName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Log the lead (in production: store to DB, forward to CRM, or send notification)
    console.log("[COMPARE LEAD]", {
      name, phone, city, vehicleName, vehicleSlug, brandName,
      source: source || "compare",
      intent: intent || "get_quote",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[COMPARE LEAD] Error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
