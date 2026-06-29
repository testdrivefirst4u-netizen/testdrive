import { NextRequest, NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";

async function getDealerForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      adminDealer: { select: { id: true, brandId: true } },
      dealer:      { select: { id: true, brandId: true } },
    },
  });
  return user?.adminDealer ?? user?.dealer ?? null;
}

async function canAccessLead(dealerId: string, brandId: string | null, leadId: string) {
  return prisma.lead.findFirst({
    where: {
      id: leadId,
      OR: [
        { dealerId },
        ...(brandId ? [{ brandId, dealerId: null }] : []),
      ],
    },
    select: { id: true },
  });
}

// GET /api/dealer/leads/[id]/followups
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await dealerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { id: leadId } = await params;

  const dealer = await getDealerForUser(userId);
  if (!dealer) return NextResponse.json({ error: "No dealer linked" }, { status: 403 });

  const lead = await canAccessLead(dealer.id, dealer.brandId, leadId);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const followUps = await prisma.leadFollowUp.findMany({
    where: { leadId },
    orderBy: { scheduledAt: "desc" },
  });

  return NextResponse.json({ followUps });
}

// POST /api/dealer/leads/[id]/followups
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await dealerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { id: leadId } = await params;

  const dealer = await getDealerForUser(userId);
  if (!dealer) return NextResponse.json({ error: "No dealer linked" }, { status: 403 });

  const lead = await canAccessLead(dealer.id, dealer.brandId, leadId);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const { scheduledAt, note } = await req.json();
  if (!scheduledAt) return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });

  const followUp = await prisma.leadFollowUp.create({
    data: {
      leadId,
      scheduledAt: new Date(scheduledAt),
      note: note?.trim() || null,
      status: "pending",
    },
  });

  // Auto-advance lead status to "contacted" if still "new"
  await prisma.lead.updateMany({
    where: { id: leadId, status: "new" },
    data:  { status: "contacted" },
  });

  return NextResponse.json({ followUp }, { status: 201 });
}
