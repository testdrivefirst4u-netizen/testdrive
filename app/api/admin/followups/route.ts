import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(role ?? "")) return null;
  return session;
}

// GET /api/admin/followups?dealerId=xxx&status=pending&page=1
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const dealerId = searchParams.get("dealerId") || "";
  const status   = searchParams.get("status")   || "";

  const where: any = {};
  if (status)   where.status = status;
  if (dealerId) where.lead = { dealerId };

  const followUps = await prisma.leadFollowUp.findMany({
    where,
    orderBy: [{ status: "asc" }, { scheduledAt: "asc" }],
    include: {
      lead: {
        select: {
          id: true, name: true, mobile: true, vehicleName: true,
          city: true, status: true, dealerId: true, brandId: true,
          dealer: { select: { id: true, name: true, city: true, brand: { select: { name: true } } } },
        },
      },
    },
  });

  // Group by dealer
  const grouped: Record<string, { dealer: any; followUps: any[] }> = {};
  for (const fu of followUps) {
    const d = fu.lead.dealer;
    const key = d?.id ?? "unassigned";
    if (!grouped[key]) {
      grouped[key] = {
        dealer: d ?? { id: "unassigned", name: "Unassigned", city: "", brand: null },
        followUps: [],
      };
    }
    grouped[key].followUps.push(fu);
  }

  const groups = Object.values(grouped).sort((a, b) =>
    (a.dealer.name ?? "").localeCompare(b.dealer.name ?? "")
  );

  return NextResponse.json({ groups, total: followUps.length });
}
