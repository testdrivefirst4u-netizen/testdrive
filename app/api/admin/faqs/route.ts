import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId") || undefined;
    const general   = searchParams.get("general") === "true";

    const where: any = general
      ? { vehicleId: null }
      : vehicleId
        ? { vehicleId }
        : {};

    const faqs = await prisma.faq.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: { vehicle: { select: { name: true, brand: { select: { name: true } } } } },
    });
    return NextResponse.json(faqs);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { question, answer, category, vehicleId, sortOrder, isActive } = await req.json();
    if (!question || !answer) return NextResponse.json({ error: "Question and answer required" }, { status: 400 });

    const faq = await prisma.faq.create({
      data: {
        question, answer,
        category:  category  || null,
        vehicleId: vehicleId || null,
        sortOrder: sortOrder || 0,
        isActive:  isActive !== false,
      },
      include: { vehicle: { select: { name: true, brand: { select: { name: true } } } } },
    });
    return NextResponse.json(faq, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
