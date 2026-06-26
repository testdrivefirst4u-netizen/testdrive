import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  });

  const header = "Email,Name,Source,Status,Subscribed At\n";
  const rows = subscribers.map((s) =>
    [
      `"${s.email}"`,
      `"${s.name ?? ""}"`,
      `"${s.source ?? "website"}"`,
      `"${s.status}"`,
      `"${s.subscribedAt.toISOString()}"`,
    ].join(",")
  );
  const csv = header + rows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
