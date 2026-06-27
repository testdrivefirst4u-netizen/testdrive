import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as any).role as string | undefined;
  if (!role || !["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });

  const header = "Name,Email,Status,Source,Subscribed At\n";
  const rows = subscribers.map((s) =>
    [
      `"${(s.name ?? "").replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${s.status}"`,
      `"${(s.source ?? "website").replace(/"/g, '""')}"`,
      `"${s.subscribedAt.toISOString()}"`,
    ].join(",")
  );
  const csv = header + rows.join("\n");

  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="subscribers-${today}.csv"`,
    },
  });
}
