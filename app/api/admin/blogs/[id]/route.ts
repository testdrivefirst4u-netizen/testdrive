import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(blog);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, excerpt, content, coverImage, coverFileId, author, tags, type, vehicleId, status } = body;

  const blog = await prisma.blog.update({
    where: { id },
    data: {
      title, excerpt, content, coverImage, coverFileId, author,
      tags: tags || [], type, vehicleId, status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });
  return NextResponse.json(blog);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.blog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
