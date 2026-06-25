import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { question, answer, category, vehicleId, sortOrder, isActive } = await req.json();

    const faq = await prisma.faq.update({
      where: { id },
      data: {
        question:  question  ?? undefined,
        answer:    answer    ?? undefined,
        category:  category  ?? undefined,
        vehicleId: vehicleId ?? undefined,
        sortOrder: sortOrder ?? undefined,
        isActive:  isActive  ?? undefined,
      },
    });
    return NextResponse.json(faq);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.faq.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
