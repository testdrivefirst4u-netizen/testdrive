import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role as string;
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");
  const status  = searchParams.get("status");
  const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit   = Math.min(100, parseInt(searchParams.get("limit") ?? "20"));

  const where: any = {};
  if (brandId) where.brandId = brandId;
  if (status)  where.status = status.toUpperCase();

  // DEALER_ADMIN can only see their own dealer
  if (role === "DEALER_ADMIN") {
    const user = await prisma.user.findUnique({ where: { id: (session.user as any).id }, select: { adminDealer: { select: { id: true } } } });
    if (user?.adminDealer) where.id = user.adminDealer.id;
    else return NextResponse.json([]);
  }

  const [dealers, total] = await Promise.all([
    prisma.dealer.findMany({
      where,
      include: { brand: { select: { id: true, name: true, logo: true } }, adminUser: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dealer.count({ where }),
  ]);

  return NextResponse.json({ dealers, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role as string;
  if (!["SUPER_ADMIN", "ADMIN"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { adminEmail, adminName, adminPassword, ...dealerData } = body;

  try {
    // Create dealer admin user if email provided
    let adminUserId: string | undefined;
    if (adminEmail && adminName && adminPassword) {
      const bcrypt = (await import("bcryptjs")).default;
      const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (existing) return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
      const newUser = await prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: await bcrypt.hash(adminPassword, 12),
          role: "DEALER_ADMIN",
          isActive: true,
        },
      });
      adminUserId = newUser.id;
    }

    const dealer = await prisma.dealer.create({
      data: { ...dealerData, ...(adminUserId ? { adminUserId } : {}) },
      include: { brand: { select: { id: true, name: true } } },
    });

    if (adminUserId) {
      await prisma.user.update({ where: { id: adminUserId }, data: { dealerId: dealer.id } });
    }

    return NextResponse.json(dealer, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Dealer code already exists" }, { status: 400 });
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
