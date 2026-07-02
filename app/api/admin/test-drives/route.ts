import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(role ?? "")) return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const page  = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));

  const where: any = status ? { status } : {};

  const [visits, total] = await Promise.all([
    prisma.testDriveVisit.findMany({
      where,
      include: {
        lead: {
          select: {
            name: true, mobile: true, city: true, buyTime: true,
            preferredTime: true, address: true, latitude: true, longitude: true,
          },
        },
        dealer: { select: { name: true, code: true, brand: { select: { name: true } } } },
        assignedDriver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.testDriveVisit.count({ where }),
  ]);

  return NextResponse.json({ visits, total, pages: Math.ceil(total / limit) });
}
