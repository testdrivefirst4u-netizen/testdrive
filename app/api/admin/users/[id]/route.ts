import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, permissions: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const callerRole = (session.user as any)?.role;
    const { id }     = await params;

    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only SUPER_ADMIN can modify another SUPER_ADMIN
    if (target.role === "SUPER_ADMIN" && callerRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Cannot modify a Super Admin" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role, permissions } = body;

    // Only SUPER_ADMIN can assign SUPER_ADMIN role
    if (role === "SUPER_ADMIN" && callerRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can assign this role" }, { status: 403 });
    }

    const data: any = { name, email, role };
    if (permissions !== undefined) data.permissions = permissions;
    if (password) data.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, permissions: true },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const callerRole = (session.user as any)?.role;
    const { id }     = await params;

    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (target.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Super Admin cannot be deleted" }, { status: 403 });
    }

    // Only SUPER_ADMIN can delete ADMIN
    if (target.role === "ADMIN" && callerRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can delete an Admin" }, { status: 403 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
