import { prisma } from "@/lib/prisma";

interface LeadInput {
  brandId: string;
  city?: string;
  pincode?: string;
  vehicle?: string;
}

function isBusinessHours(businessHours: any[]): boolean {
  if (!businessHours?.length) return true;
  const now = new Date();
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const day = days[now.getDay()];
  const bh = businessHours.find((h: any) => h.day === day);
  if (!bh || bh.closed) return false;
  const [oh, om] = bh.open.split(":").map(Number);
  const [ch, cm] = bh.close.split(":").map(Number);
  const current = now.getHours() * 60 + now.getMinutes();
  return current >= oh * 60 + om && current <= ch * 60 + cm;
}

async function resetDailyCountIfNeeded(dealer: any) {
  const last = new Date(dealer.lastCountReset);
  const now = new Date();
  if (last.toDateString() !== now.toDateString()) {
    await prisma.dealer.update({
      where: { id: dealer.id },
      data: { todayLeadCount: 0, lastCountReset: now },
    });
    dealer.todayLeadCount = 0;
  }
}

export async function assignLead(leadId: string, leadInput: LeadInput): Promise<string | null> {
  const rule = await prisma.crmAssignmentRule.findUnique({
    where: { brandId: leadInput.brandId },
  });

  if (!rule) return null;

  const dealers = await prisma.dealer.findMany({
    where: {
      brandId: leadInput.brandId,
      status: "ACTIVE",
      isAvailable: true,
      autoAssign: true,
    },
    orderBy: { priority: "desc" },
  });

  if (!dealers.length) return null;

  // Reset daily counts if needed
  for (const d of dealers) await resetDailyCountIfNeeded(d);

  // Filter by capacity
  const available = dealers.filter(d => d.todayLeadCount < d.maxLeadsPerDay);
  if (!available.length) return null;

  let chosen: (typeof dealers)[number] | null = null;

  switch (rule.strategy) {
    case "pincode": {
      if (leadInput.pincode && rule.pincodeMap) {
        const map = rule.pincodeMap as any[];
        const entry = map.find(m => m.pincode === leadInput.pincode);
        if (entry) chosen = available.find(d => d.id === entry.dealer) ?? null;
      }
      if (!chosen) chosen = roundRobin(available, rule);
      break;
    }
    case "city": {
      if (leadInput.city && rule.cityMap) {
        const map = rule.cityMap as any[];
        const entry = map.find(m => m.city?.toLowerCase() === leadInput.city?.toLowerCase());
        if (entry) chosen = available.find(d => d.id === entry.dealer) ?? null;
      }
      if (!chosen) chosen = roundRobin(available, rule);
      break;
    }
    case "vehicle": {
      if (leadInput.vehicle && rule.vehicleMap) {
        const map = rule.vehicleMap as any[];
        const entry = map.find(m => m.vehicle?.toLowerCase() === leadInput.vehicle?.toLowerCase());
        if (entry) chosen = available.find(d => d.id === entry.dealer) ?? null;
      }
      if (!chosen) chosen = roundRobin(available, rule);
      break;
    }
    case "weighted": {
      const total = available.reduce((s, d) => s + d.weight, 0);
      let rand = Math.random() * total;
      for (const d of available) {
        rand -= d.weight;
        if (rand <= 0) { chosen = d; break; }
      }
      if (!chosen) chosen = available[0];
      break;
    }
    case "priority": {
      chosen = available[0]; // already sorted by priority desc
      break;
    }
    case "random": {
      chosen = available[Math.floor(Math.random() * available.length)];
      break;
    }
    default: {
      chosen = roundRobin(available, rule);
    }
  }

  if (!chosen) return null;

  // Business hours check
  const bh = chosen.businessHours as any[] | null;
  if (bh && !isBusinessHours(bh)) {
    if (rule.afterHoursAction === "assign_24x7" && rule.dealer24x7Id) {
      const d24 = available.find(d => d.id === rule.dealer24x7Id);
      if (d24) chosen = d24;
    } else if (rule.afterHoursAction === "skip") {
      return null;
    }
    // "queue" falls through and assigns anyway
  }

  const now = new Date();

  await Promise.all([
    prisma.crmLead.update({
      where: { id: leadId },
      data: {
        dealerId: chosen.id,
        status: "assigned",
        assignedAt: now,
        reassignTimer: rule.autoReassignEnabled
          ? new Date(now.getTime() + rule.reassignAfterMinutes * 60 * 1000)
          : null,
        history: {
          push: { action: "assigned", dealerId: chosen.id, at: now.toISOString() },
        } as any,
      },
    }),
    prisma.dealer.update({
      where: { id: chosen.id },
      data: { todayLeadCount: { increment: 1 }, lastAssignedAt: now },
    }),
    prisma.crmAssignmentRule.update({
      where: { brandId: leadInput.brandId },
      data: { lastAssignedDealerId: chosen.id },
    }),
  ]);

  return chosen.id;
}

function roundRobin(dealers: any[], rule: any): any {
  const idx = (rule.lastAssignedIndex + 1) % dealers.length;
  // fire-and-forget index update (best-effort)
  prisma.crmAssignmentRule
    .update({ where: { id: rule.id }, data: { lastAssignedIndex: idx } })
    .catch(() => {});
  return dealers[idx];
}
