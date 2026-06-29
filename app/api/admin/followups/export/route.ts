import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(role ?? "")) return null;
  return session;
}

// GET /api/admin/followups/export?dealerId=xxx
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const dealerId = searchParams.get("dealerId") || "";

  const where: any = { status: { not: "cancelled" } };
  if (dealerId) where.lead = { dealerId };

  const followUps = await prisma.leadFollowUp.findMany({
    where,
    orderBy: { scheduledAt: "asc" },
    include: {
      lead: {
        select: {
          name: true, mobile: true, email: true, city: true,
          vehicleName: true, status: true,
          dealer: { select: { name: true, city: true } },
        },
      },
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
    ["Dealer", "Dealer City", "Lead Name", "Mobile", "Email", "City", "Vehicle", "Lead Status", "Follow-up Date", "Follow-up Status", "Note", "Outcome"],
    ...followUps.map(fu => [
      fu.lead.dealer?.name,
      fu.lead.dealer?.city,
      fu.lead.name,
      fu.lead.mobile,
      fu.lead.email,
      fu.lead.city,
      fu.lead.vehicleName,
      fu.lead.status,
      new Date(fu.scheduledAt).toLocaleString("en-IN"),
      fu.status,
      fu.note,
      fu.outcome,
    ]),
  ];

  const csv = rows.map(row => row.map(escape).join(",")).join("\r\n");
  const filename = dealerId
    ? `followups-dealer-${dealerId}-${new Date().toISOString().slice(0,10)}.csv`
    : `followups-all-${new Date().toISOString().slice(0,10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
