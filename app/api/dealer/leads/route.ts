import { NextRequest, NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await dealerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role   = (session.user as any).role as string;
  const userId = (session.user as any).id  as string;

  if (!["DEALER_ADMIN", "SALES_EXECUTIVE"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!userId) return NextResponse.json({ error: "Session missing user ID" }, { status: 401 });

  // Get the dealer this user belongs to
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      adminDealer: { select: { id: true, brandId: true, name: true, status: true } },
      dealer:      { select: { id: true, brandId: true, name: true, status: true } },
    },
  });

  const dealer = user?.adminDealer ?? user?.dealer;
  if (!dealer) return NextResponse.json({ leads: [], meta: { total: 0 }, dealer: null });

  const { searchParams } = new URL(req.url);
  const page   = Math.max(1, parseInt(searchParams.get("page")   ?? "1"));
  const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";

  // Only show leads explicitly assigned to this dealer (dealerId = dealer.id)
  // This ensures inactive dealers only see their previously assigned leads,
  // and new leads (which skip inactive dealers) never appear here.
  const where: any = { dealerId: dealer.id };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name:        { contains: search, mode: "insensitive" } },
      { mobile:      { contains: search } },
      { vehicleName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: { brand: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({
    leads,
    dealer,
    meta: {
      total, page, pages: Math.ceil(total / limit),
      hasPrev: page > 1, hasNext: page < Math.ceil(total / limit),
    },
  });
}
