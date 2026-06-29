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
  const search = searchParams.get("search")?.trim() ?? "";
  const status = searchParams.get("status")?.trim() ?? "";

  // Show leads explicitly assigned to this dealer OR unassigned leads for their brand.
  // Leads can have dealerId=null when assignDealer couldn't find an eligible dealer at
  // submission time (all at capacity / outside hours). Those still belong to the brand.
  const andConditions: any[] = [
    {
      OR: [
        { dealerId: dealer.id },
        ...(dealer.brandId ? [{ brandId: dealer.brandId, dealerId: null }] : []),
      ],
    },
    // Show old leads (field absent in MongoDB) OR leads whose release date has passed.
    // isSet:false catches documents created before releaseAt was added to the schema.
    {
      OR: [
        { releaseAt: { isSet: false } },
        { releaseAt: { lte: new Date() } },
      ],
    },
  ];

  if (status) andConditions.push({ status });

  if (search) {
    andConditions.push({
      OR: [
        { name:        { contains: search, mode: "insensitive" } },
        { mobile:      { contains: search } },
        { vehicleName: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const where = andConditions.length === 1 ? andConditions[0] : { AND: andConditions };

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

  // Per-status counts (unfiltered except by dealer/brand)
  const baseWhere: any = {
    OR: [
      { dealerId: dealer.id },
      ...(dealer.brandId ? [{ brandId: dealer.brandId, dealerId: null }] : []),
    ],
  };
  const [newCount, contactedCount, convertedCount, lostCount] = await Promise.all([
    prisma.lead.count({ where: { ...baseWhere, status: "new" } }),
    prisma.lead.count({ where: { ...baseWhere, status: "contacted" } }),
    prisma.lead.count({ where: { ...baseWhere, status: "converted" } }),
    prisma.lead.count({ where: { ...baseWhere, status: "lost" } }),
  ]);

  return NextResponse.json({
    leads,
    dealer,
    statusCounts: { new: newCount, contacted: contactedCount, converted: convertedCount, lost: lostCount },
    meta: {
      total, page, pages: Math.ceil(total / limit),
      hasPrev: page > 1, hasNext: page < Math.ceil(total / limit),
    },
  });
}
