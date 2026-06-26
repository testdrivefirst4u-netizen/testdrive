import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids, action, dealerId, status } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No lead IDs provided" }, { status: 400 });
  }

  if (action === "assign" && dealerId) {
    await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data:  { dealerId },
    });
    return NextResponse.json({ ok: true, updated: ids.length });
  }

  if (action === "status" && status) {
    const VALID = ["new", "contacted", "converted", "lost"];
    if (!VALID.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data:  { status },
    });
    return NextResponse.json({ ok: true, updated: ids.length });
  }

  if (action === "delete") {
    await prisma.lead.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ ok: true, deleted: ids.length });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
