import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { notifyDealerFollowUp } from "@/lib/notify";

// Call this route from a cron service (e.g. Vercel Cron, GitHub Actions, cron-job.org)
// with header: Authorization: Bearer <CRON_SECRET>
// Recommended schedule: every 6 hours

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  // Find all "new" leads assigned to a dealer that have been waiting 24h+
  const staleLeads = await prisma.lead.findMany({
    where: {
      status: "new",
      dealerId: { not: null },
      createdAt: { lt: cutoff },
    },
    include: {
      dealer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (staleLeads.length === 0) {
    return NextResponse.json({ ok: true, reminded: 0, message: "No stale leads" });
  }

  // Group by dealer
  const byDealer = new Map<string, typeof staleLeads>();
  for (const lead of staleLeads) {
    if (!lead.dealer?.email) continue;
    const key = lead.dealerId!;
    if (!byDealer.has(key)) byDealer.set(key, []);
    byDealer.get(key)!.push(lead);
  }

  let reminded = 0;
  const now = Date.now();

  for (const [, leads] of byDealer) {
    const dealer = leads[0].dealer!;
    if (!dealer.email) continue;

    await notifyDealerFollowUp({
      dealerEmail: dealer.email,
      dealerName:  dealer.name,
      leads: leads.map(l => ({
        name:        l.name,
        mobile:      l.mobile,
        vehicleName: l.vehicleName,
        hoursAgo:    Math.floor((now - new Date(l.createdAt).getTime()) / 3_600_000),
      })),
    });

    reminded++;
  }

  console.log(`[CRON lead-followup] Reminded ${reminded} dealer(s) about ${staleLeads.length} stale lead(s)`);
  return NextResponse.json({ ok: true, reminded, leadsCount: staleLeads.length });
}
