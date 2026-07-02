import { NextRequest, NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";

const VALID_STATUSES = ["SCHEDULED", "EN_ROUTE", "ARRIVED", "COMPLETED", "CANCELLED"];

async function getDealerSession() {
  const session = await dealerAuth();
  if (!session?.user) return null;
  const role = (session.user as any)?.role as string | undefined;
  if (!["DEALER_ADMIN", "SALES_EXECUTIVE"].includes(role ?? "")) return null;
  return session;
}

async function getSessionDealerId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      adminDealer: { select: { id: true } },
      dealer:      { select: { id: true } },
    },
  });
  return user?.adminDealer?.id ?? user?.dealer?.id ?? null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session.user as any)?.id as string;
  const dealerId = await getSessionDealerId(userId);
  if (!dealerId) return NextResponse.json({ error: "No dealer linked to your account" }, { status: 400 });

  const { id } = await params;
  const visit = await prisma.testDriveVisit.findUnique({ where: { id } });
  if (!visit || visit.dealerId !== dealerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { status, notes, driverId } = body;

  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (driverId) {
    const driver = await prisma.user.findUnique({ where: { id: driverId } });
    if (!driver || driver.dealerId !== dealerId || driver.role !== "DRIVER") {
      return NextResponse.json({ error: "Invalid driver" }, { status: 400 });
    }
  }

  const now = new Date();
  const updated = await prisma.testDriveVisit.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(driverId !== undefined && { assignedDriverId: driverId || null }),
      ...(status === "EN_ROUTE" && !visit.enRouteAt && { enRouteAt: now }),
      ...(status === "ARRIVED" && !visit.arrivedAt && { arrivedAt: now }),
      ...(status === "COMPLETED" && !visit.completedAt && { completedAt: now }),
    },
  });

  return NextResponse.json({ visit: updated });
}
