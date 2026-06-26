import prisma from "@/lib/prisma";
import { notifyDealerNewLead } from "@/lib/notify";

type BusinessHours = {
  [day: string]: { open: string; close: string; isOpen: boolean };
};

function isDealerOpenNow(businessHours: unknown): boolean {
  if (!businessHours || typeof businessHours !== "object") return true;
  const bh = businessHours as BusinessHours;
  const now = new Date();
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayKey = days[now.getDay()];
  const dayConfig = bh[dayKey];
  if (!dayConfig) return true;
  if (!dayConfig.isOpen) return false;

  const [openH, openM] = dayConfig.open.split(":").map(Number);
  const [closeH, closeM] = dayConfig.close.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

interface AssignResult {
  dealerId: string | null;
  dealerEmail?: string;
  dealerName?: string;
}

export async function assignDealer(
  brandId: string | null | undefined,
  leadInfo?: { name: string; mobile: string; vehicleName?: string; source?: string }
): Promise<string | null> {
  if (!brandId) return null;

  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const dealers = await prisma.dealer.findMany({
    where:   { brandId, status: "ACTIVE", isAvailable: true },
    orderBy: [{ priority: "asc" }, { lastAssignedAt: "asc" }],
  });

  if (!dealers.length) return null;

  for (const dealer of dealers) {
    if (!isDealerOpenNow(dealer.businessHours)) continue;

    const resetDate = new Date(dealer.lastCountReset);
    resetDate.setHours(0, 0, 0, 0);
    const isNewDay     = resetDate < today;
    const currentCount = isNewDay ? 0 : dealer.todayLeadCount;

    if (currentCount < dealer.maxLeadsPerDay) {
      await prisma.dealer.update({
        where: { id: dealer.id },
        data: {
          lastAssignedAt: now,
          todayLeadCount: isNewDay ? 1 : { increment: 1 },
          ...(isNewDay ? { lastCountReset: now } : {}),
        },
      });

      if (leadInfo) {
        notifyDealerNewLead({
          dealerEmail:  dealer.email,
          dealerName:   dealer.name,
          leadName:     leadInfo.name,
          leadMobile:   leadInfo.mobile,
          vehicleName:  leadInfo.vehicleName,
          source:       leadInfo.source ?? "website",
        }).catch(() => {});
      }

      return dealer.id;
    }
  }

  // If all open dealers are at capacity, fall back to any available dealer (outside hours)
  for (const dealer of dealers) {
    if (isDealerOpenNow(dealer.businessHours)) continue;
    const resetDate = new Date(dealer.lastCountReset);
    resetDate.setHours(0, 0, 0, 0);
    const isNewDay     = resetDate < today;
    const currentCount = isNewDay ? 0 : dealer.todayLeadCount;
    if (currentCount < dealer.maxLeadsPerDay) {
      await prisma.dealer.update({
        where: { id: dealer.id },
        data: {
          lastAssignedAt: now,
          todayLeadCount: isNewDay ? 1 : { increment: 1 },
          ...(isNewDay ? { lastCountReset: now } : {}),
        },
      });
      return dealer.id;
    }
  }

  return null;
}
