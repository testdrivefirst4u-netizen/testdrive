"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, User } from "lucide-react";

export type NewsArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  author: string | null;
  type: string;
  publishedAt: string | null;
  createdAt: string;
};

export type NewsGroups = {
  news: NewsArticle[];
  reviews: NewsArticle[];
  videos: NewsArticle[];
};

const TABS: Array<{ key: keyof NewsGroups; label: string }> = [
  { key: "news", label: "Car News" },
  { key: "reviews", label: "Expert Reviews" },
  { key: "videos", label: "Videos" },
];

function formatDate(iso: string | null, fallback: string) {
  const d = iso || fallback;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(d));
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/news/${article.slug}`}
      className="flex-shrink-0 w-[280px] sm:w-[340px] bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 group"
    >
      {/* Thumbnail */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <span className="text-blue-300 text-5xl font-black">{article.title[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug mb-2 group-hover:text-blue-700 transition-colors">
          {article.title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-2.5">
          {article.author && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {article.author}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(article.publishedAt, article.createdAt)}
          </span>
        </div>
        {article.excerpt && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{article.excerpt}</p>
        )}
      </div>
    </Link>
  );
}

export function NewsTabs({ groups }: { groups: NewsGroups }) {
  const [active, setActive] = useState<keyof NewsGroups>("news");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const articles = groups[active];

  function updateArrows() {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -640 : 640, behavior: "smooth" });
    setTimeout(updateArrows, 350);
  }

  const total = groups.news.length + groups.reviews.length + groups.videos.length;
  if (total === 0) return null;

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-blue-700 font-semibold text-xs uppercase tracking-widest mb-1">Stay Updated</p>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Latest Car Updates</h2>
          </div>

          {/* Pill tabs */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            {TABS.map((tab) => {
              const hasContent = groups[tab.key].length > 0;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActive(tab.key);
                    setCanLeft(false);
                    setCanRight(groups[tab.key].length > 3);
                    scrollRef.current?.scrollTo({ left: 0 });
                  }}
                  disabled={!hasContent}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    active === tab.key
                      ? "bg-white text-blue-700 shadow-sm"
                      : hasContent
                        ? "text-gray-500 hover:text-gray-800"
                        : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards */}
        {articles.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No {TABS.find((t) => t.key === active)?.label} available yet
          </div>
        ) : (
          <div className="relative group/news">
            {canLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute -left-4 top-[80px] z-10 w-9 h-9 bg-white shadow-lg rounded-full border border-gray-100 flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-all opacity-0 group-hover/news:opacity-100"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            {canRight && articles.length > 3 && (
              <button
                onClick={() => scroll("right")}
                className="absolute -right-4 top-[80px] z-10 w-9 h-9 bg-white shadow-lg rounded-full border border-gray-100 flex items-center justify-center hover:bg-blue-50 hover:border-blue-200 transition-all opacity-0 group-hover/news:opacity-100"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            )}
            <div
              ref={scrollRef}
              onScroll={updateArrows}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2 -mx-1 px-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {articles.map((a) => <NewsCard key={a.id} article={a} />)}
            </div>
          </div>
        )}

        {/* All news link */}
        <div className="mt-5">
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-blue-700 font-semibold text-sm hover:gap-2.5 transition-all"
          >
            All News <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
