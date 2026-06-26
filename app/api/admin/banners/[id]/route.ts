import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { title, subtitle, imageUrl, fileId, linkUrl, linkLabel, position, isActive, sortOrder, startsAt, endsAt } = body;

    const banner = await (prisma.banner.update as any)({
      where: { id },
      data: {
        title, subtitle, imageUrl, fileId, linkUrl, linkLabel, position, isActive, sortOrder,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt:   endsAt   ? new Date(endsAt)   : null,
      },
    });
    return NextResponse.json(banner);
  } catch {
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
