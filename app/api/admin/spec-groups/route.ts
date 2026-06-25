import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET() {
  try {
    const groups = await prisma.specGroup.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { specItems: true } }, specItems: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json(groups);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, icon, sortOrder } = await req.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const slug  = slugify(name);
    const group = await prisma.specGroup.create({
      data: { name, slug, icon: icon || null, sortOrder: sortOrder || 0 },
    });
    return NextResponse.json(group, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Spec group already exists" }, { status: 409 });
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
