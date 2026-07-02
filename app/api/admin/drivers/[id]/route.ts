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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const driver = await prisma.user.findUnique({ where: { id } });
  if (!driver || driver.role !== "DRIVER") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { password, isActive } = body;

  const data: any = {};
  if (password !== undefined) {
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }
    data.password = await bcrypt.hash(password, 12);
  }
  if (isActive !== undefined) data.isActive = !!isActive;

  await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}
