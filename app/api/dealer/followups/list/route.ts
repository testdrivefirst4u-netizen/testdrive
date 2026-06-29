import { NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";

// GET /api/dealer/followups/list — all follow-ups for this dealer's leads
export async function GET() {
  const session = await dealerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      adminDealer: { select: { id: true, brandId: true } },
      dealer:      { select: { id: true, brandId: true } },
    },
  });
  const dealer = user?.adminDealer ?? user?.dealer;
  if (!dealer) return NextResponse.json({ followUps: [] });

  const leadFilter = {
    OR: [
      { dealerId: dealer.id },
      ...(dealer.brandId ? [{ brandId: dealer.brandId, dealerId: null }] : []),
    ],
  };

  const followUps = await prisma.leadFollowUp.findMany({
    where: { lead: leadFilter, status: { not: "cancelled" } },
    orderBy: [{ status: "asc" }, { scheduledAt: "asc" }],
    include: {
      lead: {
        select: { id: true, name: true, mobile: true, vehicleName: true, city: true, status: true },
      },
    },
  });

  // Sort: pending overdue first, then today, then upcoming, then done
  const now       = new Date();
  const todayEnd  = new Date(now); todayEnd.setHours(23, 59, 59, 999);

  followUps.sort((a, b) => {
    const rank = (f: typeof a) => {
      if (f.status === "done")      return 4;
      if (f.status === "cancelled") return 5;
      const d = new Date(f.scheduledAt);
      if (d < now && d.toDateString() !== now.toDateString()) return 0; // overdue
      if (d <= todayEnd) return 1; // today
      return 2; // upcoming
    };
    const ra = rank(a), rb = rank(b);
    if (ra !== rb) return ra - rb;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });

  return NextResponse.json({ followUps });
}
