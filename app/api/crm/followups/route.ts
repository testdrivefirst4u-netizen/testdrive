import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role   = (session.user as any).role as string;
  const userId = (session.user as any).id as string;

  const { searchParams } = new URL(req.url);
  const leadId   = searchParams.get("leadId");
  const dealerId = searchParams.get("dealerId");
  const status   = searchParams.get("status");

  const where: any = {};
  if (leadId)   where.leadId   = leadId;
  if (dealerId) where.dealerId = dealerId;
  if (status)   where.status   = status;
  if (role === "SALES_EXECUTIVE") where.executiveId = userId;

  const followUps = await prisma.crmFollowUp.findMany({
    where,
    include: {
      lead: { select: { customerName: true, mobile: true, vehicle: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
  return NextResponse.json(followUps);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const lead = await prisma.crmLead.findUnique({ where: { id: body.leadId }, select: { dealerId: true } });
  if (!lead?.dealerId) return NextResponse.json({ error: "Lead has no dealer" }, { status: 400 });

  const fu = await prisma.crmFollowUp.create({
    data: { ...body, dealerId: lead.dealerId, executiveId: userId },
  });
  return NextResponse.json(fu, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, ...data } = await req.json();
  if (data.status === "completed" && !data.completedAt) data.completedAt = new Date();

  const fu = await prisma.crmFollowUp.update({ where: { id }, data });
  return NextResponse.json(fu);
}
