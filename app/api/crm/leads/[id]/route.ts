import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.crmLead.findUnique({
    where: { id },
    include: {
      brand:     true,
      dealer:    { include: { staff: { select: { id: true, name: true } } } },
      executive: { select: { id: true, name: true, email: true, phone: true } },
      followUps:  { orderBy: { scheduledAt: "asc" } },
      testDrives: { orderBy: { scheduledAt: "asc" } },
      bookings:   { orderBy: { createdAt: "desc" } },
    },
  });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { addNote, ...data } = await req.json();
  const userId = (session.user as any).id as string;

  if (addNote) {
    const lead = await prisma.crmLead.findUnique({ where: { id }, select: { leadNotes: true } });
    const notes = (lead?.leadNotes as any[] | null) ?? [];
    data.leadNotes = [...notes, { note: addNote, by: userId, at: new Date().toISOString() }];
  }

  if (data.status) {
    const lead = await prisma.crmLead.findUnique({ where: { id }, select: { history: true } });
    const hist = (lead?.history as any[] | null) ?? [];
    data.history = [...hist, { action: "status_change", status: data.status, by: userId, at: new Date().toISOString() }];
    if (data.status === "assigned" && !data.openedAt) data.openedAt = new Date();
  }

  const updated = await prisma.crmLead.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role as string;
  if (!["SUPER_ADMIN", "ADMIN"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.crmLead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
