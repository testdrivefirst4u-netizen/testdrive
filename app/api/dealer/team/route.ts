import { NextRequest, NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function getDealerSession() {
  const session = await dealerAuth();
  if (!session?.user) return null;
  const role = (session.user as any)?.role as string | undefined;
  if (!["DEALER_ADMIN", "SALES_EXECUTIVE"].includes(role ?? "")) return null;
  return session;
}

async function getSessionDealerId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      adminDealer: { select: { id: true } },
      dealer:      { select: { id: true } },
    },
  });
  return user?.adminDealer?.id ?? user?.dealer?.id ?? null;
}

export async function GET() {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session.user as any)?.id as string;
  const dealerId = await getSessionDealerId(userId);
  if (!dealerId) return NextResponse.json({ error: "No dealer linked to your account" }, { status: 400 });

  const team = await prisma.user.findMany({
    where: { dealerId, role: "SALES_EXECUTIVE" },
    select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ team });
}

export async function POST(req: NextRequest) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const userId = (session.user as any)?.id as string;
  const dealerId = await getSessionDealerId(userId);
  if (!dealerId) return NextResponse.json({ error: "No dealer linked to your account" }, { status: 400 });

  const body = await req.json();
  const { name, email, phone, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }

  try {
    const hashed = await bcrypt.hash(password, 12);
    const executive = await prisma.user.create({
      data: { name, email, phone: phone || null, password: hashed, role: "SALES_EXECUTIVE", dealerId },
      select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true },
    });
    return NextResponse.json({ executive }, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    console.error("[TEAM CREATE]", e);
    return NextResponse.json({ error: "Failed to create executive" }, { status: 500 });
  }
}
