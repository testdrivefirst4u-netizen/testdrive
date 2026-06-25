import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const source = searchParams.get("source") || "";
    const status = searchParams.get("status") || "";

    const where: any = {
      ...(source ? { source } : {}),
      ...(status ? { status } : {}),
    };

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    const headers = ["Name", "Mobile", "Email", "City", "Vehicle", "Source", "Status", "Notes", "Created At"];
    const rows = leads.map(l => [
      l.name,
      l.mobile,
      l.email || "",
      l.city  || "",
      l.vehicleName || "",
      l.source,
      l.status,
      (l.notes || "").replace(/[\n\r,]/g, " "),
      new Date(l.createdAt).toISOString().replace("T", " ").slice(0, 19),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type":        "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Export failed" }, { status: 500 });
  }
}
