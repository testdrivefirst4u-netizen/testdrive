import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(role ?? "")) return null;
  return session;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { loginEmail, loginPassword, loginName } = await req.json();

  if (!loginEmail) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  // Find the dealer and its linked admin user
  const dealer = await prisma.dealer.findUnique({
    where: { id },
    select: { adminUserId: true },
  });

  if (!dealer) return NextResponse.json({ error: "Dealer not found" }, { status: 404 });
  if (!dealer.adminUserId) return NextResponse.json({ error: "No login account linked to this dealer" }, { status: 404 });

  // Check email isn't already taken by another user
  const conflict = await prisma.user.findFirst({
    where: { email: loginEmail, id: { not: dealer.adminUserId } },
    select: { id: true },
  });
  if (conflict) return NextResponse.json({ error: "Email already in use by another account" }, { status: 409 });

  const data: any = { email: loginEmail };
  if (loginName)     data.name     = loginName;
  if (loginPassword) data.password = await bcrypt.hash(loginPassword, 12);

  const user = await prisma.user.update({
    where: { id: dealer.adminUserId },
    data,
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ success: true, user });
}
