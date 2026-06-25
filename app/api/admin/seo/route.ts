import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const TYPE_FIELD: Record<string, string> = {
  vehicle: "vehicleId",
  brand:   "brandId",
  news:    "newsId",
  blog:    "blogId",
};

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, entityId, data } = body;

    if (!TYPE_FIELD[type]) return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    if (!entityId)         return NextResponse.json({ error: "entityId required" }, { status: 400 });

    const field = TYPE_FIELD[type];

    const seoFields = {
      metaTitle:       data.metaTitle       || null,
      metaDescription: data.metaDescription || null,
      metaKeywords:    data.metaKeywords    || null,
      canonicalUrl:    data.canonicalUrl    || null,
      ogTitle:         data.ogTitle         || null,
      ogDescription:   data.ogDescription   || null,
      ogImage:         data.ogImage         || null,
      schema:          data.schema          || null,
    };

    const seo = await (prisma.seo as any).upsert({
      where:  { [field]: entityId },
      update: seoFields,
      create: { [field]: entityId, ...seoFields },
    });

    return NextResponse.json(seo);
  } catch (e: any) {
    console.error("[seo POST]", e?.message);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type     = searchParams.get("type");
    const entityId = searchParams.get("entityId");

    if (!type || !TYPE_FIELD[type] || !entityId) {
      return NextResponse.json({ error: "type and entityId required" }, { status: 400 });
    }

    const field = TYPE_FIELD[type];
    const seo   = await (prisma.seo as any).findUnique({ where: { [field]: entityId } });
    return NextResponse.json(seo || {});
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
