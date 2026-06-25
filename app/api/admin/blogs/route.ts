import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const where: any = {};
    if (status) where.status = status;

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.blog.count({ where }),
    ]);
    return NextResponse.json({ blogs, total, pages: Math.ceil(total / limit) });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title, excerpt, content, coverImage, coverFileId, author, tags, type, vehicleId, status } = body;

    if (!title || !content) return NextResponse.json({ error: "Title and content required" }, { status: 400 });

    const baseSlug = slugify(title);
    let slug = baseSlug;
    let count = 1;
    while (await prisma.blog.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const blog = await prisma.blog.create({
      data: {
        title, slug, excerpt, content, coverImage, coverFileId, author,
        tags: tags || [], type: type || "article", vehicleId,
        status: status || "DRAFT",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
    });
    return NextResponse.json(blog, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}
