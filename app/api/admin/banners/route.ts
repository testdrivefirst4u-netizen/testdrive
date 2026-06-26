import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get("position") || "";
    const where: any = {};
    if (position) where.position = position;

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [{ position: "asc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json({ banners });
  } catch {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, subtitle, imageUrl, fileId, linkUrl, linkLabel, position, isActive, sortOrder, startsAt, endsAt } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: "Title and image are required" }, { status: 400 });
    }

    const banner = await (prisma.banner.create as any)({
      data: {
        title,
        subtitle:  subtitle  || null,
        imageUrl,
        fileId:    fileId    || null,
        linkUrl:   linkUrl   || null,
        linkLabel: linkLabel || null,
        position:  position  || "hero",
        isActive:  isActive !== false,
        sortOrder: sortOrder || 0,
        startsAt:  startsAt  ? new Date(startsAt) : null,
        endsAt:    endsAt    ? new Date(endsAt)   : null,
      },
    });
    return NextResponse.json(banner, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
