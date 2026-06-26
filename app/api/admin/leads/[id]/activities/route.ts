import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const activities = await prisma.leadActivity.findMany({
    where:   { leadId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const userName = (session.user as any).name ?? (session.user as any).email ?? "Admin";
  const userId   = (session.user as any).id as string | undefined;

  const activity = await prisma.leadActivity.create({
    data: { leadId: id, userId, userName, type: "note", content: content.trim() },
  });
  return NextResponse.json(activity);
}
