import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (search) where.title = { contains: search, mode: "insensitive" };
    if (status) where.status = status;

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, slug: true, status: true, author: true, viewCount: true, publishedAt: true, createdAt: true, coverImage: true, type: true },
      }),
      prisma.news.count({ where }),
    ]);

    return NextResponse.json({ news, total, page, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, excerpt, content, coverImage, coverFileId, author, tags, vehicleId, brandId, type, status, publishedAt } = body;

    if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 });

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.news.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const news = await prisma.news.create({
      data: {
        title, slug, excerpt, content, coverImage, coverFileId, author,
        tags: tags || [], vehicleId, brandId,
        type: type || "news",
        status: status || "DRAFT",
        publishedAt: status === "PUBLISHED" ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
      },
    });
    return NextResponse.json(news, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002") return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 });
  }
}
