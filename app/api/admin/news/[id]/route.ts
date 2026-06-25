import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const news = await prisma.news.findUnique({ where: { id }, include: { seo: true } });
    if (!news) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { title, excerpt, content, coverImage, coverFileId, author, tags, vehicleId, brandId, type, status, publishedAt } = body;

    const news = await prisma.news.update({
      where: { id },
      data: {
        title, excerpt, content, coverImage, coverFileId, author,
        tags: tags || [], vehicleId, brandId, type, status,
        publishedAt: status === "PUBLISHED" ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
      },
    });
    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.news.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
