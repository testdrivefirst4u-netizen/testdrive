import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const report = await req.json().catch(() => null);
  if (report) {
    console.warn("[CSP Violation]", JSON.stringify(report));
  }
  return NextResponse.json(null, { status: 204 });
}
