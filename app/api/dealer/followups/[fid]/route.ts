import { NextRequest, NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";

// PATCH /api/dealer/followups/[fid]  — mark done or cancel
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ fid: string }> }) {
  const session = await dealerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { fid } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      adminDealer: { select: { id: true, brandId: true } },
      dealer:      { select: { id: true, brandId: true } },
    },
  });
  const dealer = user?.adminDealer ?? user?.dealer;
  if (!dealer) return NextResponse.json({ error: "No dealer linked" }, { status: 403 });

  // Verify the follow-up belongs to a lead this dealer can access
  const existing = await prisma.leadFollowUp.findUnique({
    where: { id: fid },
    include: { lead: { select: { dealerId: true, brandId: true } } },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const lead = existing.lead;
  const canAccess =
    lead.dealerId === dealer.id ||
    (dealer.brandId && lead.brandId === dealer.brandId && lead.dealerId === null);
  if (!canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status, outcome } = await req.json();
  if (!["done", "cancelled", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.leadFollowUp.update({
    where: { id: fid },
    data: {
      status,
      outcome: outcome?.trim() || null,
      doneAt: status === "done" ? new Date() : null,
    },
  });

  return NextResponse.json({ followUp: updated });
}
