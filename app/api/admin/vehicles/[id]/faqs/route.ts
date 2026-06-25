import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const faqs = await prisma.faq.findMany({
    where: { vehicleId: id },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(faqs);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { question, answer, category, sortOrder } = body;

  if (!question || !answer) return NextResponse.json({ error: "Question and answer required" }, { status: 400 });

  const faq = await prisma.faq.create({
    data: { vehicleId: id, question, answer, category, sortOrder: sortOrder || 0 },
  });
  return NextResponse.json(faq, { status: 201 });
}

// Bulk replace all FAQs for a vehicle (used on edit save)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { faqs } = await req.json();

  await prisma.faq.deleteMany({ where: { vehicleId: id } });

  if (faqs?.length) {
    await prisma.faq.createMany({
      data: faqs.map((f: any, i: number) => ({
        vehicleId: id,
        question: f.question,
        answer: f.answer,
        sortOrder: i,
      })),
    });
  }

  return NextResponse.json({ success: true });
}
