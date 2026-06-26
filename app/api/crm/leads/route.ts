import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assignLead } from "@/lib/crm/assignment-engine";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role   = (session.user as any).role as string;
  const userId = (session.user as any).id as string;

  const { searchParams } = new URL(req.url);
  const page     = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit    = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));
  const search   = searchParams.get("search") ?? "";
  const status   = searchParams.get("status") ?? "";
  const brandId  = searchParams.get("brandId") ?? "";
  const dealerId = searchParams.get("dealerId") ?? "";
  const priority = searchParams.get("priority") ?? "";

  const where: any = {};

  if (role === "DEALER_ADMIN") {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { adminDealer: { select: { id: true } } } });
    where.dealerId = user?.adminDealer?.id;
  } else if (role === "SALES_EXECUTIVE") {
    where.executiveId = userId;
  } else if (dealerId) {
    where.dealerId = dealerId;
  }

  if (status)   where.status   = status;
  if (brandId)  where.brandId  = brandId;
  if (priority) where.priority = priority;
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { mobile:       { contains: search } },
      { email:        { contains: search, mode: "insensitive" } },
      { vehicle:      { contains: search, mode: "insensitive" } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.crmLead.findMany({
      where,
      include: {
        brand:     { select: { id: true, name: true, logo: true } },
        dealer:    { select: { id: true, name: true, city: true } },
        executive: { select: { id: true, name: true } },
        _count:    { select: { followUps: true, testDrives: true, bookings: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.crmLead.count({ where }),
  ]);

  return NextResponse.json({
    leads,
    meta: { total, page, pages: Math.ceil(total / limit), hasPrev: page > 1, hasNext: page < Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { autoAssign = true, ...data } = body;

  // Duplicate check: same mobile + brandId in last 24h
  if (data.mobile && data.brandId) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dup = await prisma.crmLead.findFirst({
      where: { mobile: data.mobile, brandId: data.brandId, createdAt: { gte: since } },
    });
    if (dup) {
      data.isDuplicate = true;
      data.duplicateOfId = dup.id;
    }
  }

  data.history = [{ action: "created", source: data.source ?? "website", at: new Date().toISOString() }];

  const lead = await prisma.crmLead.create({ data });

  if (autoAssign && data.brandId && !data.isDuplicate) {
    await assignLead(lead.id, { brandId: data.brandId, city: data.city, pincode: data.pincode, vehicle: data.vehicle });
  }

  const updated = await prisma.crmLead.findUnique({
    where: { id: lead.id },
    include: { dealer: { select: { id: true, name: true } } },
  });

  return NextResponse.json(updated, { status: 201 });
}
