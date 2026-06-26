import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { dealerAuth } from "@/lib/auth-dealer";

export async function GET(req: NextRequest) {
  const session = await dealerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role   = (session.user as any).role as string;
  const userId = (session.user as any).id  as string;

  if (!["DEALER_ADMIN", "SALES_EXECUTIVE"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      adminDealer: { select: { id: true } },
      dealer:      { select: { id: true } },
    },
  });

  const dealer = user?.adminDealer ?? user?.dealer;
  if (!dealer) return NextResponse.json({ unread: 0, leads: [] });

  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");
  const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [unread, leads] = await Promise.all([
    prisma.lead.count({
      where: { dealerId: dealer.id, status: "new", createdAt: { gte: sinceDate } },
    }),
    prisma.lead.findMany({
      where: { dealerId: dealer.id, status: "new", createdAt: { gte: sinceDate } },
      select: { id: true, name: true, mobile: true, vehicleName: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({ unread, leads });
}
