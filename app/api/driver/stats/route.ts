import { NextResponse } from "next/server";
import { driverAuth } from "@/lib/auth-driver";
import prisma from "@/lib/prisma";

async function getDriverSession() {
  const session = await driverAuth();
  if (!session?.user) return null;
  const role = (session.user as any)?.role as string | undefined;
  if (role !== "DRIVER") return null;
  return session;
}

export async function GET() {
  const session = await getDriverSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const driverId = (session.user as any)?.id as string;

  const completed = await prisma.testDriveVisit.findMany({
    where: { assignedDriverId: driverId, status: "COMPLETED" },
    select: { tripDistanceKm: true, customerRating: true, completedAt: true },
  });

  const tripsCompleted = completed.length;
  const totalKm = completed.reduce((sum, t) => sum + (t.tripDistanceKm ?? 0), 0);
  const rated = completed.filter((t) => t.customerRating != null);
  const avgRating = rated.length
    ? rated.reduce((sum, t) => sum + (t.customerRating ?? 0), 0) / rated.length
    : null;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const tripsToday = completed.filter((t) => t.completedAt && t.completedAt >= startOfToday).length;

  return NextResponse.json({
    tripsCompleted,
    totalKm: Math.round(totalKm * 10) / 10,
    avgRating: avgRating != null ? Math.round(avgRating * 10) / 10 : null,
    tripsToday,
  });
}
