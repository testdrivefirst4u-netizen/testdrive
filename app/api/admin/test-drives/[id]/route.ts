import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(role ?? "")) return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const visit = await prisma.testDriveVisit.findUnique({ where: { id } });
  if (!visit) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { action } = body;

  let data: any = {};

  if (action === "cancel") {
    if (visit.status === "COMPLETED" || visit.status === "CANCELLED") {
      return NextResponse.json({ error: "Trip is already finished" }, { status: 400 });
    }
    data = { status: "CANCELLED" };
  } else if (action === "reset") {
    if (visit.status === "COMPLETED" || visit.status === "CANCELLED") {
      return NextResponse.json({ error: "Cannot reset a finished trip" }, { status: 400 });
    }
    data = {
      status: "SCHEDULED",
      assignedDriverId: null,
      enRouteAt: null,
      arrivedAt: null,
      tripStartLat: null,
      tripStartLon: null,
      tripStartAt: null,
      pickupLat: null,
      pickupLon: null,
      pickupAt: null,
      pickupDistanceM: null,
      driverLastLat: null,
      driverLastLon: null,
      driverLastLocationAt: null,
    };
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await prisma.testDriveVisit.update({ where: { id }, data });
  return NextResponse.json({ visit: updated });
}
