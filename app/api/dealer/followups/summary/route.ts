import { NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";

// GET /api/dealer/followups/summary
// Returns counts: overdue, today, upcoming — used by sidebar badge + dashboard
export async function GET() {
  const session = await dealerAuth();
  if (!session) return NextResponse.json({ overdue: 0, today: 0, upcoming: 0 });

  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      adminDealer: { select: { id: true, brandId: true } },
      dealer:      { select: { id: true, brandId: true } },
    },
  });
  const dealer = user?.adminDealer ?? user?.dealer;
  if (!dealer) return NextResponse.json({ overdue: 0, today: 0, upcoming: 0 });

  const now       = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd   = new Date(now); todayEnd.setHours(23, 59, 59, 999);
  const weekEnd    = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);

  // All pending follow-ups for leads accessible by this dealer
  const leadFilter = {
    OR: [
      { dealerId: dealer.id },
      ...(dealer.brandId ? [{ brandId: dealer.brandId, dealerId: null }] : []),
    ],
  };

  const [overdue, today, upcoming] = await Promise.all([
    prisma.leadFollowUp.count({
      where: { status: "pending", scheduledAt: { lt: todayStart }, lead: leadFilter },
    }),
    prisma.leadFollowUp.count({
      where: { status: "pending", scheduledAt: { gte: todayStart, lte: todayEnd }, lead: leadFilter },
    }),
    prisma.leadFollowUp.count({
      where: { status: "pending", scheduledAt: { gt: todayEnd, lte: weekEnd }, lead: leadFilter },
    }),
  ]);

  return NextResponse.json({ overdue, today, upcoming });
}
