import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(role ?? "")) return null;
  return session;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const dealer = await prisma.dealer.findUnique({
    where: { id },
    include: { brand: { select: { id: true, name: true } } },
  });
  if (!dealer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dealer);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json();

  const { name, code, brandId, email, phone, managerName, managerPhone, address, city, state, priority, maxLeadsPerDay, status, isAvailable } = body;

  try {
    const dealer = await prisma.dealer.update({
      where: { id },
      data: {
        ...(name          !== undefined ? { name }                          : {}),
        ...(code          !== undefined ? { code }                          : {}),
        ...(brandId       !== undefined ? { brandId }                       : {}),
        ...(email         !== undefined ? { email }                         : {}),
        ...(phone         !== undefined ? { phone }                         : {}),
        ...(managerName   !== undefined ? { managerName }                   : {}),
        ...(managerPhone  !== undefined ? { managerPhone }                  : {}),
        ...(address       !== undefined ? { address }                       : {}),
        ...(city          !== undefined ? { city }                          : {}),
        ...(state         !== undefined ? { state }                         : {}),
        ...(priority      !== undefined ? { priority: Number(priority) }    : {}),
        ...(maxLeadsPerDay !== undefined ? { maxLeadsPerDay: Number(maxLeadsPerDay) } : {}),
        ...(status        !== undefined ? { status }                        : {}),
        ...(isAvailable   !== undefined ? { isAvailable }                   : {}),
      },
      include: { brand: { select: { id: true, name: true } } },
    });
    return NextResponse.json(dealer);
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Dealer code already exists" }, { status: 409 });
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.dealer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
