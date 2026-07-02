import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session || !["SUPER_ADMIN", "ADMIN"].includes(role ?? "")) return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER" },
    select: {
      id: true, name: true, email: true, phone: true, isActive: true, createdAt: true,
      dealer: { select: { id: true, name: true, code: true, brand: { select: { name: true } } } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ drivers });
}
