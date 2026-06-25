import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, User, Eye, ArrowLeft, Tag, Clock, ArrowRight, BookOpen } from "lucide-react";
import prisma from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";

interface Props { params: Promise<{ slug: string }> }

async function getPost(slug: string) {
  return prisma.blog.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { seo: true },
  }).catch(() => null);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seo?.metaTitle ?? `${post.title} | Walley Blog`,
    description: post.seo?.metaDescription ?? post.excerpt ?? `Read: ${post.title}`,
    canonicalPath: `/blog/${slug}`,
    ogImage: post.seo?.ogImage ?? post.coverImage ?? undefined,
  });
}

function formatDate(d: Date | null | string, fallback: Date | string) {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date((d || fallback) as string));
}

function readingTime(content: string) {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  await prisma.blog.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const related = await prisma.blog.findMany({
    where: { status: "PUBLISHED", id: { not: post.id } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { id: true, title: true, slug: true, coverImage: true, author: true, publishedAt: true, createdAt: true },
  }).catch(() => []);

  const tags: string[] = Array.isArray(post.tags) ? post.tags as string[] : [];
  const mins = readingTime(post.content);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="relative bg-gradient-to-b from-slate-900 to-blue-950 text-white overflow-hidden">
        {post.coverImage && (
          <img src={post.coverImage} alt={post.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20" />
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="text-blue-500">/</span>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <span className="text-blue-500">/</span>
            <span className="text-blue-200 truncate max-w-[200px]">{post.title}</span>
          </nav>

          <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-600/60 border border-blue-400/30 text-blue-100 px-2.5 py-1 rounded-full mb-4">
            {post.type === "article" ? "Article" : post.type}
          </span>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight mb-5 max-w-3xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-blue-200 text-base leading-relaxed mb-6 max-w-2xl">{post.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-blue-300">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> {post.author || "Walley Editorial"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.publishedAt, post.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {mins} min read
            </span>
            {post.viewCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> {post.viewCount.toLocaleString("en-IN")} views
              </span>
            )}
          </div>
        </div>
      </div>

      {post.coverImage && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6 mb-0 relative z-10">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img src={post.coverImage} alt={post.title}
              className="w-full max-h-[420px] object-cover" />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

          {/* Post body */}
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
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

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

            <div className="mt-8">
              <Link href="/blog"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Post Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Author</p>
                    <p className="font-semibold text-gray-800 text-xs">{post.author || "Walley Editorial"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-purple-700" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Published</p>
                    <p className="font-semibold text-gray-800 text-xs">{formatDate(post.publishedAt, post.createdAt)}</p>
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

            <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-5 text-white">
              <p className="font-bold text-sm mb-1">Get Car Loan EMI</p>
              <p className="text-blue-200 text-xs mb-4">Calculate your monthly payment in seconds.</p>
              <Link href="/emi-calculator"
                className="flex items-center justify-center gap-2 h-9 px-4 bg-white text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-50 transition-all">
                Calculate Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">Suggest a Topic</h3>
              <p className="text-xs text-gray-500 mb-3">Have an idea for an article? Let us know.</p>
              <Link href="/contact"
                className="flex items-center justify-center gap-2 h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all">
                Contact Editorial
              </Link>
            </div>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-bold text-gray-900 text-lg mb-5">More from the Blog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="h-36 bg-gradient-to-br from-slate-100 to-blue-50 overflow-hidden">
                    {p.coverImage
                      ? <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-gray-200" /></div>
                    }
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-gray-900 text-xs leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">{p.title}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{formatDate(p.publishedAt, p.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
