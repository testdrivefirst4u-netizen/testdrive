import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      brand:      { select: { id: true, name: true } },
      dealer:     { select: { id: true, name: true } },
      activities: { orderBy: { createdAt: "asc" } },
    },
  }).catch(() => null);

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, notes } = body;

  const VALID_STATUSES = ["new", "contacted", "converted", "lost"];
  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const prev = await prisma.lead.findUnique({ where: { id }, select: { status: true, notes: true } });

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(notes  !== undefined ? { notes  } : {}),
    },
  });

  const userName = (session.user as any).name ?? (session.user as any).email ?? "Admin";
  const userId   = (session.user as any).id as string | undefined;

  if (status && prev?.status !== status) {
    await prisma.leadActivity.create({
      data: {
        leadId:   id,
        userId,
        userName,
        type:     "status_change",
        content:  `Status changed from "${prev?.status ?? "?"}" to "${status}"`,
        metadata: { from: prev?.status, to: status },
      },
    });
  }
  if (notes !== undefined && notes !== prev?.notes) {
    await prisma.leadActivity.create({
      data: {
        leadId:   id,
        userId,
        userName,
        type:     "note",
        content:  notes ? `Note added: ${notes.slice(0, 120)}` : "Note cleared",
        metadata: { note: notes },
      },
    });
  }

  await createAuditLog({
    userId,
    userName,
    action:   "update",
    entity:   "Lead",
    entityId: id,
    changes:  body,
  });

  return NextResponse.json(lead);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { dealerId } = await req.json();

  const prev = await prisma.lead.findUnique({ where: { id }, select: { dealerId: true, dealer: { select: { name: true } } } });

  const lead = await prisma.lead.update({
    where: { id },
    data:  { dealerId: dealerId || null },
    include: { dealer: { select: { id: true, name: true } } },
  });

  const userName = (session.user as any).name ?? (session.user as any).email ?? "Admin";
  const userId   = (session.user as any).id as string | undefined;

  const prevDealerName = (prev as any)?.dealer?.name ?? "Unassigned";
  const newDealerName  = (lead as any)?.dealer?.name ?? "Unassigned";

  await prisma.leadActivity.create({
    data: {
      leadId:   id,
      userId,
      userName,
      type:     "assignment",
      content:  `Reassigned from "${prevDealerName}" to "${newDealerName}"`,
      metadata: { from: prev?.dealerId, to: dealerId },
    },
  });

  await createAuditLog({ userId, userName, action: "reassign", entity: "Lead", entityId: id, changes: { dealerId } });

  return NextResponse.json(lead);
}
