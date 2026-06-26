import { NextRequest, NextResponse } from "next/server";
import { dealerAuth } from "@/lib/auth-dealer";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await dealerAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role as string;
  if (!["DEALER_ADMIN", "SALES_EXECUTIVE"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id }  = await params;
  const { status, notes } = await req.json();

  const VALID = ["new", "contacted", "converted", "lost"];
  if (status && !VALID.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(status            ? { status }                  : {}),
      ...(notes !== undefined ? { notes }                 : {}),
    },
  });
  return NextResponse.json(lead);
}
