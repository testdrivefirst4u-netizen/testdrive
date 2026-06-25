import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const callerRole = (session.user as any)?.role;
    const body       = await req.json();
    const { name, email, password, role, permissions } = body;

    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    if (role === "SUPER_ADMIN" && callerRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Only Super Admin can create a Super Admin" }, { status: 403 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user   = await prisma.user.create({
      data: { name, email, password: hashed, role: role || "EDITOR", permissions: permissions || [] },
      select: { id: true, name: true, email: true, role: true, permissions: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
