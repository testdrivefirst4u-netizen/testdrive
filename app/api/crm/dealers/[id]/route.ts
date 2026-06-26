import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const dealer = await prisma.dealer.findUnique({
    where: { id },
    include: {
      brand: true,
      adminUser: { select: { id: true, name: true, email: true, phone: true } },
      staff: { select: { id: true, name: true, email: true, phone: true, isActive: true, lastLogin: true } },
      _count: { select: { crmLeads: true, followUps: true, testDrives: true } },
    },
  });
  if (!dealer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dealer);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role as string;

  const { id } = await params;

  // DEALER_ADMIN can update their own dealer
  if (role === "DEALER_ADMIN") {
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { adminDealer: { select: { id: true } } },
    });
    if (user?.adminDealer?.id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const dealer = await prisma.dealer.update({ where: { id }, data: body });
  return NextResponse.json(dealer);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role as string;
  if (!["SUPER_ADMIN", "ADMIN"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.dealer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
