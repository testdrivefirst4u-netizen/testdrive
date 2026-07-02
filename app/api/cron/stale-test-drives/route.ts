import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Call this route from a cron service (e.g. Vercel Cron, GitHub Actions, cron-job.org)
// with header: Authorization: Bearer <CRON_SECRET>
// Recommended schedule: every 6 hours
//
// Auto-cancels test-drive visits that never progressed:
//  - scheduled slot passed 24h+ ago and the trip never completed/cancelled
//  - no scheduled time at all, and the booking itself is 48h+ old with no driver activity

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const scheduledCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const createdCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const stale = await prisma.testDriveVisit.findMany({
    where: {
      status: { in: ["SCHEDULED", "EN_ROUTE", "ARRIVED"] },
      OR: [
        { scheduledAt: { lt: scheduledCutoff } },
        { scheduledAt: null, createdAt: { lt: createdCutoff } },
      ],
    },
    select: { id: true },
  });

  if (stale.length === 0) {
    return NextResponse.json({ ok: true, cancelled: 0, message: "No stale test drives" });
  }

  await prisma.testDriveVisit.updateMany({
    where: { id: { in: stale.map((v) => v.id) } },
    data: { status: "CANCELLED", notes: "Auto-cancelled: no activity within the expected window" },
  });

  console.log(`[CRON stale-test-drives] Auto-cancelled ${stale.length} stale test drive(s)`);
  return NextResponse.json({ ok: true, cancelled: stale.length });
}
