import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const source     = searchParams.get("source")     ?? "";
    const status     = searchParams.get("status")     ?? "";
    const brandId    = searchParams.get("brandId")    ?? "";
    const q          = searchParams.get("q")          ?? "";
    const unassigned = searchParams.get("unassigned") === "1";

    const where: any = {
      ...(source     ? { source }         : {}),
      ...(status     ? { status }         : {}),
      ...(brandId    ? { brandId }        : {}),
      ...(unassigned ? { dealerId: null } : {}),
    };
    if (q) {
      where.OR = [
        { name:   { contains: q, mode: "insensitive" } },
        { mobile: { contains: q } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        brand:  { select: { name: true } },
        dealer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    const headers = ["Name", "Mobile", "Email", "City", "Vehicle", "Type", "Buy Time", "Sell Car", "Brand", "Dealer", "Source", "Status", "Notes", "Created At"];
    const rows = leads.map(l => [
      l.name,
      l.mobile,
      l.email       ?? "",
      l.city        ?? "",
      l.vehicleName ?? "",
      l.vehicleType ?? "",
      l.buyTime     ?? "",
      l.sellCar     ?? "",
      l.brand?.name  ?? "",
      l.dealer?.name ?? "",
      l.source,
      l.status,
      (l.notes ?? "").replace(/[\n\r,]/g, " "),
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
