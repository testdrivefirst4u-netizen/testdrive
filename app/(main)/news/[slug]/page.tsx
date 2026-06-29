import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, User, Eye, ArrowLeft, Tag, Clock, ArrowRight, Newspaper } from "lucide-react";
import prisma from "@/lib/prisma";
import { buildMetadata, newsArticleJsonLd, breadcrumbJsonLd } from "@/lib/seo";

interface Props { params: Promise<{ slug: string }> }

async function getArticle(slug: string) {
  return prisma.news.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { seo: true },
  }).catch(() => null);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return buildMetadata({
    title:       article.seo?.metaTitle       ?? `${article.title} | Auto News`,
    description: article.seo?.metaDescription ?? article.excerpt ?? `Read the latest: ${article.title}`,
    canonicalPath: `/news/${slug}`,
    ogImage:     article.seo?.ogImage ?? article.coverImage ?? undefined,
    type:        "article",
    publishedAt: article.publishedAt ?? article.createdAt,
    modifiedAt:  article.updatedAt,
    author:      article.author ?? undefined,
  });
}

function formatDate(d: Date | null | string, fallback: Date | string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date((d || fallback) as string));
}

function readingTime(content: string) {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  await prisma.news.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const related = await prisma.news.findMany({
    where: { status: "PUBLISHED", id: { not: article.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { id: true, title: true, slug: true, coverImage: true, author: true, publishedAt: true, createdAt: true, type: true },
  }).catch(() => []);

  const tags: string[] = Array.isArray(article.tags) ? article.tags as string[] : [];
  const mins = readingTime(article.content);

  const jsonLd = [
    newsArticleJsonLd({
      title:       article.title,
      description: article.excerpt,
      slug,
      coverImage:  article.coverImage,
      author:      article.author,
      publishedAt: article.publishedAt ?? article.createdAt,
      updatedAt:   article.updatedAt,
    }),
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "News", url: "/news" },
      { name: article.title, url: `/news/${slug}` },
    ]),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="relative bg-gradient-to-b from-slate-900 to-blue-950 text-white overflow-hidden">
        {article.coverImage && (
          <img src={article.coverImage} alt={article.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="text-blue-500">/</span>
            <Link href="/news" className="hover:text-white">News</Link>
            <span className="text-blue-500">/</span>
            <span className="text-blue-200 truncate max-w-[200px]">{article.title}</span>
          </nav>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/60 border border-blue-400/30 text-blue-100 px-2.5 py-1 rounded-full">
              {article.type === "review" ? "Review" : article.type === "video" ? "Video" : "News"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-5 max-w-3xl">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-blue-200 text-base leading-relaxed mb-6 max-w-2xl">{article.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-blue-300">
            {article.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> {article.author}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(article.publishedAt, article.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {mins} min read
            </span>
            {article.viewCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> {article.viewCount.toLocaleString("en-IN")} views
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cover image below hero */}
      {article.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 mb-0 relative z-10">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img src={article.coverImage} alt={article.title}
              className="w-full max-h-[420px] object-cover" />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

          {/* Article body */}
          <div>
            <div
              className="prose prose-slate prose-sm sm:prose-base max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-md
                prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:rounded-r-xl prose-blockquote:py-1
                prose-strong:text-gray-900
                prose-ul:text-gray-700 prose-ol:text-gray-700
                bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors cursor-pointer">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Back link */}
            <div className="mt-8">
              <Link href="/news"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to All News
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Article info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Article Info</h3>
              <div className="space-y-3 text-sm">
                {article.author && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Author</p>
                      <p className="font-semibold text-gray-800 text-xs">{article.author}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Published</p>
                    <p className="font-semibold text-gray-800 text-xs">{formatDate(article.publishedAt, article.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Read Time</p>
                    <p className="font-semibold text-gray-800 text-xs">{mins} min</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-5 text-white">
              <p className="font-bold text-sm mb-1">Book a Test Drive</p>
              <p className="text-blue-200 text-xs mb-4">Experience any car at your doorstep for free.</p>
              <Link href="/test-drive"
                className="flex items-center justify-center gap-2 h-9 px-4 bg-white text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-50 transition-all">
                Book Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-bold text-gray-900 text-lg mb-5">More from Walley</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((a) => (
                <Link key={a.id} href={`/news/${a.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-36 bg-gradient-to-br from-slate-100 to-blue-50 overflow-hidden">
                    {a.coverImage
                      ? <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center"><Newspaper className="w-8 h-8 text-gray-200" /></div>
                    }
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">{a.title}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{formatDate(a.publishedAt, a.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
