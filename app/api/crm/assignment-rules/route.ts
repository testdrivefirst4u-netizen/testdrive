import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rules = await prisma.crmAssignmentRule.findMany({
    include: { brand: { select: { id: true, name: true, logo: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(rules);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role as string;
  if (!["SUPER_ADMIN", "ADMIN"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { brandId, ...data } = await req.json();

  const rule = await prisma.crmAssignmentRule.upsert({
    where: { brandId },
    update: data,
    create: { brandId, ...data },
    include: { brand: { select: { id: true, name: true } } },
  });
  return NextResponse.json(rule);
}
