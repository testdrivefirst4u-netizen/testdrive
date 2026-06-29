import { NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";

// GET /api/dealer/followups/export — download CSV of all follow-ups for this dealer's leads
export async function GET() {
  const session = await dealerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      adminDealer: { select: { id: true, brandId: true, name: true } },
      dealer:      { select: { id: true, brandId: true, name: true } },
    },
  });
  const dealer = user?.adminDealer ?? user?.dealer;
  if (!dealer) return NextResponse.json({ error: "No dealer" }, { status: 403 });

  const leadFilter = {
    OR: [
      { dealerId: dealer.id },
      ...(dealer.brandId ? [{ brandId: dealer.brandId, dealerId: null }] : []),
    ],
  };

  const followUps = await prisma.leadFollowUp.findMany({
    where: { lead: leadFilter, status: { not: "cancelled" } },
    orderBy: { scheduledAt: "asc" },
    include: {
      lead: { select: { name: true, mobile: true, email: true, city: true, vehicleName: true, status: true } },
    },
  });

  const escape = (v: string | null | undefined) => {
    if (!v) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = [
    ["Lead Name", "Mobile", "Email", "City", "Vehicle", "Lead Status", "Follow-up Date", "Follow-up Status", "Note", "Outcome"],
    ...followUps.map(fu => [
      fu.lead.name, fu.lead.mobile, fu.lead.email, fu.lead.city,
      fu.lead.vehicleName, fu.lead.status,
      new Date(fu.scheduledAt).toLocaleString("en-IN"),
      fu.status, fu.note, fu.outcome,
    ]),
  ];

  const csv = rows.map(r => r.map(escape).join(",")).join("\r\n");
  const filename = `followups-${dealer.name?.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0,10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
