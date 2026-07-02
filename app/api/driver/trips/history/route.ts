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

  const trips = await prisma.testDriveVisit.findMany({
    where: { assignedDriverId: driverId, status: "COMPLETED" },
    include: {
      lead: {
        select: {
          name: true, mobile: true, city: true, buyTime: true,
          preferredTime: true, address: true, latitude: true, longitude: true,
        },
      },
    },
    orderBy: { completedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ trips });
}
