import prisma from "@/lib/prisma";
import { NewsTabs, type NewsGroups } from "@/components/home/NewsTabs";

async function getGroupedNews(): Promise<NewsGroups> {
  try {
    const articles = await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      take: 18,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true, title: true, slug: true, excerpt: true,
        coverImage: true, author: true, type: true,
        publishedAt: true, createdAt: true,
      },
    });

    return {
      news: articles
        .filter((a) => a.type === "news" || a.type === "article")
        .map((a) => ({ ...a, publishedAt: a.publishedAt?.toISOString() ?? null, createdAt: a.createdAt.toISOString() })),
      reviews: articles
        .filter((a) => a.type === "review")
        .map((a) => ({ ...a, publishedAt: a.publishedAt?.toISOString() ?? null, createdAt: a.createdAt.toISOString() })),
      videos: articles
        .filter((a) => a.type === "video")
        .map((a) => ({ ...a, publishedAt: a.publishedAt?.toISOString() ?? null, createdAt: a.createdAt.toISOString() })),
    };
  } catch {
    return { news: [], reviews: [], videos: [] };
  }
}

export async function NewsSection() {
  const groups = await getGroupedNews();
  const total = groups.news.length + groups.reviews.length + groups.videos.length;
  if (total === 0) return null;
  return <NewsTabs groups={groups} />;
}
