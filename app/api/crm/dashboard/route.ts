import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role   = (session.user as any).role as string;
  const userId = (session.user as any).id as string;

  const now    = new Date();
  const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const month  = new Date(now.getFullYear(), now.getMonth(), 1);

  let dealerFilter: any = {};
  if (role === "DEALER_ADMIN") {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { adminDealer: { select: { id: true } } } });
    if (user?.adminDealer) dealerFilter = { dealerId: user.adminDealer.id };
  } else if (role === "SALES_EXECUTIVE") {
    dealerFilter = { executiveId: userId };
  }

  const [
    totalLeads,
    todayLeads,
    monthLeads,
    unassigned,
    byStatus,
    totalDealers,
    activeDealers,
    pendingFollowUps,
    overdueFollowUps,
  ] = await Promise.all([
    prisma.crmLead.count({ where: dealerFilter }),
    prisma.crmLead.count({ where: { ...dealerFilter, createdAt: { gte: today } } }),
    prisma.crmLead.count({ where: { ...dealerFilter, createdAt: { gte: month } } }),
    prisma.crmLead.count({ where: { status: "new", dealerId: null } }),
    prisma.crmLead.groupBy({ by: ["status"], where: dealerFilter, _count: { _all: true } }),
    role === "SUPER_ADMIN" || role === "ADMIN" ? prisma.dealer.count() : Promise.resolve(0),
    role === "SUPER_ADMIN" || role === "ADMIN" ? prisma.dealer.count({ where: { status: "ACTIVE" } }) : Promise.resolve(0),
    prisma.crmFollowUp.count({ where: { ...("dealerId" in dealerFilter ? dealerFilter : {}), status: "pending", scheduledAt: { gte: now } } }),
    prisma.crmFollowUp.count({ where: { ...("dealerId" in dealerFilter ? dealerFilter : {}), status: "pending", scheduledAt: { lt: now } } }),
  ]);

  return NextResponse.json({
    totalLeads,
    todayLeads,
    monthLeads,
    unassigned,
    byStatus: Object.fromEntries(byStatus.map(s => [s.status, s._count._all])),
    totalDealers,
    activeDealers,
    pendingFollowUps,
    overdueFollowUps,
  });
}
