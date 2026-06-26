import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role as string;
  if (!["SUPER_ADMIN", "ADMIN"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(Date.now() - 30 * 86400000);
  const to   = searchParams.get("to")   ? new Date(searchParams.get("to")!)   : new Date();

  const [leadsPerDay, leadsPerBrand, leadsPerDealer, conversionByStatus, topSources] = await Promise.all([
    prisma.crmLead.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.crmLead.groupBy({
      by: ["brandId"],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
      orderBy: { _count: { brandId: "desc" } },
    }),
    prisma.crmLead.groupBy({
      by: ["dealerId"],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
      orderBy: { _count: { dealerId: "desc" } },
    }),
    prisma.crmLead.groupBy({
      by: ["status"],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
    }),
    prisma.crmLead.groupBy({
      by: ["source"],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
    }),
  ]);

  // Enrich brand names
  const brandIds = leadsPerBrand.map(b => b.brandId).filter(Boolean) as string[];
  const brands = await prisma.brand.findMany({ where: { id: { in: brandIds } }, select: { id: true, name: true } });
  const brandMap = Object.fromEntries(brands.map(b => [b.id, b.name]));

  const dealerIds = leadsPerDealer.map(d => d.dealerId).filter(Boolean) as string[];
  const dealers = await prisma.dealer.findMany({ where: { id: { in: dealerIds } }, select: { id: true, name: true, city: true } });
  const dealerMap = Object.fromEntries(dealers.map(d => [d.id, `${d.name} (${d.city})`]));

  return NextResponse.json({
    leadsPerDay: leadsPerDay.map(d => ({ date: d.createdAt, count: d._count._all })),
    leadsPerBrand: leadsPerBrand.map(b => ({ brand: brandMap[b.brandId!] ?? "Unknown", count: b._count._all })),
    leadsPerDealer: leadsPerDealer.map(d => ({ dealer: dealerMap[d.dealerId!] ?? "Unassigned", count: d._count._all })),
    conversionByStatus: Object.fromEntries(conversionByStatus.map(s => [s.status, s._count._all])),
    topSources: topSources.map(s => ({ source: s.source, count: s._count._all })),
  });
}
