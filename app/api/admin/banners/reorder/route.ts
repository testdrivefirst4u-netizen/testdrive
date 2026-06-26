import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { updates } = await req.json() as { updates: { id: string; sortOrder: number }[] };

    await Promise.all(
      updates.map(({ id, sortOrder }) =>
        prisma.banner.update({ where: { id }, data: { sortOrder } })
      )
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}
