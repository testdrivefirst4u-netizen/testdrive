import { NextRequest, NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      adminDealer: { select: { id: true, brandId: true } },
      dealer:      { select: { id: true, brandId: true } },
    },
  });
  const dealer = user?.adminDealer ?? user?.dealer;
  if (!dealer) return NextResponse.json({ error: "No dealer linked" }, { status: 403 });

  const { id } = await params;
  const { status, notes } = await req.json();

  const VALID = ["new", "contacted", "converted", "lost"];
  if (status && !VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Ensure the lead belongs to this dealer or their brand (unassigned brand leads)
  const existing = await prisma.lead.findFirst({
    where: {
      id,
      OR: [
        { dealerId: dealer.id },
        ...(dealer.brandId ? [{ brandId: dealer.brandId, dealerId: null }] : []),
      ],
    },
    select: { id: true, dealerId: true },
  });
  if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  // If this was an unassigned brand lead, claim it now
  const updateData: any = {};
  if (status)            updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;
  if (!existing.dealerId) updateData.dealerId = dealer.id;

  const lead = await prisma.lead.update({ where: { id }, data: updateData });
  return NextResponse.json(lead);
}
