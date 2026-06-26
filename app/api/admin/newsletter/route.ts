import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const q      = searchParams.get("q") ?? undefined;
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit  = 50;

  const where: any = {};
  if (status && status !== "all") where.status = status;
  if (q) where.email = { contains: q, mode: "insensitive" };

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { subscribedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.newsletterSubscriber.count({ where }),
  ]);

  return NextResponse.json({ subscribers, total, page });
}
