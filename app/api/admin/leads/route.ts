import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page       = Math.max(1, parseInt(searchParams.get("page")   ?? "1"));
  const source     = searchParams.get("source")     ?? "";
  const status     = searchParams.get("status")     ?? "";
  const brandId    = searchParams.get("brandId")    ?? "";
  const q          = searchParams.get("q")          ?? "";
  const unassigned = searchParams.get("unassigned") === "1";

  const where: any = {
    ...(source     ? { source }              : {}),
    ...(status     ? { status }              : {}),
    ...(brandId    ? { brandId }             : {}),
    ...(unassigned ? { dealerId: null }      : {}),
  };

  if (q) {
    where.OR = [
      { name:        { contains: q, mode: "insensitive" } },
      { mobile:      { contains: q } },
      { vehicleName: { contains: q, mode: "insensitive" } },
      { email:       { contains: q, mode: "insensitive" } },
    ];
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        brand:  { select: { id: true, name: true } },
        dealer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({
    leads,
    meta: {
      total, page, pages: Math.ceil(total / PAGE_SIZE),
      hasPrev: page > 1, hasNext: page < Math.ceil(total / PAGE_SIZE),
    },
  });
}
