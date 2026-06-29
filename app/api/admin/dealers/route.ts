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
  const brandId = searchParams.get("brandId") ?? "";
  const page    = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
  const limit   = Math.min(100, parseInt(searchParams.get("limit") ?? "50"));

  const where: any = brandId ? { brandId } : {};

  const [dealers, total] = await Promise.all([
    prisma.dealer.findMany({
      where,
      include: {
        brand:     { select: { id: true, name: true } },
        adminUser: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ brandId: "asc" }, { priority: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dealer.count({ where }),
  ]);

  return NextResponse.json({ dealers, total, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { name, code, brandId, email, phone, managerName, managerPhone, address, city, state, priority, maxLeadsPerDay, status } = body;

  if (!name || !code || !brandId || !email || !phone || !city || !state) {
    return NextResponse.json({ error: "name, code, brand, email, phone, city, state are required" }, { status: 400 });
  }

  try {
    const dealer = await prisma.dealer.create({
      data: {
        name, code, brandId, email, phone,
        managerName:   managerName   || null,
        managerPhone:  managerPhone  || null,
        address:       address       || null,
        city, state,
        priority:      priority      ? Number(priority)      : 1,
        maxLeadsPerDay: maxLeadsPerDay ? Number(maxLeadsPerDay) : 50,
        status:        status        || "ACTIVE",
      },
      include: { brand: { select: { id: true, name: true } } },
    });
    return NextResponse.json(dealer, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Dealer code already exists" }, { status: 409 });
    console.error("[DEALER CREATE]", e);
    return NextResponse.json({ error: "Failed to create dealer" }, { status: 500 });
  }
}
