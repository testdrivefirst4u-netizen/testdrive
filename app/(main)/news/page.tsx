import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, User, Eye, TrendingUp, ArrowRight, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import prisma from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Latest Car News, Reviews & Updates in India",
  description: "Stay updated with the latest automotive news, expert car reviews, EV updates, new launches and industry insights from India's trusted auto platform.",
  keywords: "car news india, auto news, car reviews, new car launches, electric vehicle news, bike news",
  canonicalPath: "/news",
});

async function getNews() {
  try {
    return await prisma.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true, title: true, slug: true, excerpt: true,
        coverImage: true, author: true, type: true,
        viewCount: true, publishedAt: true, createdAt: true,
      },
    });
  } catch { return []; }
}

function formatDate(d: Date | null, fallback: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(d || fallback));
}

function typeColor(type: string) {
  if (type === "review") return "bg-blue-600 text-white border-0";
  if (type === "video") return "bg-purple-600 text-white border-0";
  return "bg-slate-700 text-white border-0";
}

function typeLabel(type: string) {
  if (type === "review") return "Review";
  if (type === "video") return "Video";
  if (type === "article") return "Article";
  return "News";
}

export default async function NewsPage() {
  const articles = await getNews();

  const featured = articles.slice(0, 2);
  const rest = articles.slice(2);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero strip */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-10">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-blue-200 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-400" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">News & Reviews</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-blue-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Latest Car Updates</h1>
          </div>
          <p className="text-blue-200 text-sm">
            News, expert reviews, EV updates and industry insights
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-10">

        {articles.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-500 mb-1">No articles yet</p>
            <p className="text-sm text-gray-400">Check back soon for the latest automotive news</p>
          </div>
        ) : (
          <>
            {/* Featured stories */}
            {featured.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" /> Featured Stories
                  </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {featured.map((a) => (
                    <Link
                      key={a.id}
                      href={`/news/${a.slug}`}
                      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative h-52 bg-gray-100 overflow-hidden">
                        {a.coverImage ? (
                          <img
                            src={a.coverImage} alt={a.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
                            <Newspaper className="w-12 h-12 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <Badge className={`absolute top-3 left-3 text-xs ${typeColor(a.type)}`}>
                          {typeLabel(a.type)}
                        </Badge>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-base text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors leading-snug">
                          {a.title}
                        </h3>
                        {a.excerpt && (
                          <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">{a.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center gap-3">
                            {a.author && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />{a.author}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(a.publishedAt, a.createdAt)}
                            </span>
                          </div>
                          {a.viewCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />{a.viewCount.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All articles grid */}
            {rest.length > 0 && (
              <div>
                <h2 className="font-bold text-lg text-slate-900 mb-5">More News & Reviews</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((a) => (
                    <Link
                      key={a.id}
                      href={`/news/${a.slug}`}
                      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                    >
                      <div className="relative h-44 bg-gray-100 overflow-hidden">
                        {a.coverImage ? (
                          <img
                            src={a.coverImage} alt={a.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <Newspaper className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                        <Badge className={`absolute top-2 left-2 text-[10px] ${typeColor(a.type)}`}>
                          {typeLabel(a.type)}
                        </Badge>
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors leading-snug">
                          {a.title}
                        </h3>
                        {a.excerpt && (
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3 flex-1">{a.excerpt}</p>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-50">
                          <div className="flex items-center gap-2">
                            {a.author && <span className="font-medium truncate max-w-[100px]">{a.author}</span>}
                            <span className="flex items-center gap-0.5">
                              <Calendar className="w-3 h-3" />
                              {formatDate(a.publishedAt, a.createdAt)}
                            </span>
                          </div>
                          {a.viewCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />{a.viewCount.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
