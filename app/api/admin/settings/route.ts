import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const group = searchParams.get("group");

    if (key) {
      const setting = await prisma.setting.findUnique({ where: { key } });
      return NextResponse.json(setting || { key, value: null });
    }

    const where = group ? { group } : {};
    const settings = await prisma.setting.findMany({ where, orderBy: { key: "asc" } });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { key, value, type, group, label } = body;

    if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: value?.toString() || "", type, group, label },
      create: { key, value: value?.toString() || "", type: type || "string", group, label },
    });
    return NextResponse.json(setting);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
