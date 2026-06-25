import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Clock, ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Auto Blog — Car Buying Guides, Tips & Advice | Walley",
  description: "Read expert car buying guides, maintenance tips, EV advice, and automotive insights from the Walley editorial team.",
};

const CATEGORIES = ["All", "Buying Guide", "EV", "Maintenance", "Finance", "Reviews", "News"];

const FALLBACK_POSTS = [
  { title: "10 Things to Check Before Buying a Used Car in 2026", excerpt: "A pre-purchase checklist that saves you from costly mistakes — from chassis inspection to finance clearance.", category: "Buying Guide", readTime: "6 min", slug: "used-car-checklist-2026" },
  { title: "Electric vs Petrol: Real Cost Comparison Over 5 Years", excerpt: "We crunched the numbers on fuel, servicing, insurance, and depreciation. The winner might surprise you.", category: "EV", readTime: "8 min", slug: "ev-vs-petrol-cost-comparison" },
  { title: "How to Negotiate Car Price at a Dealership (And Actually Win)", excerpt: "Tactics seasoned buyers use to get ₹30,000–₹80,000 off — without being rude or wasting half a day.", category: "Buying Guide", readTime: "5 min", slug: "negotiate-car-price-dealership" },
  { title: "Car Loan vs Outright Purchase: Which Is Smarter?", excerpt: "It depends on your interest rate, investment returns, and how long you plan to keep the car. Here's the math.", category: "Finance", readTime: "7 min", slug: "car-loan-vs-outright-purchase" },
  { title: "When to Service Your Car (And What Gets Skipped Too Often)", excerpt: "The service interval cheat-sheet every Indian car owner needs — including the items dealers conveniently forget.", category: "Maintenance", readTime: "5 min", slug: "car-service-schedule-india" },
  { title: "Home Charging for EVs in India: A Complete Setup Guide", excerpt: "From selecting the right charger to wiring and costs — everything you need before your EV arrives.", category: "EV", readTime: "9 min", slug: "ev-home-charging-setup-india" },
];

export default async function BlogPage() {
  const dbPosts = await prisma.blog.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 12,
    select: { title: true, slug: true, excerpt: true, author: true, coverImage: true, publishedAt: true, tags: true },
  }).catch(() => []);

  const hasPosts = dbPosts.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Blog</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-700/50 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Walley Auto Blog</h1>
              <p className="text-blue-200 text-sm">Buying guides, tips, and automotive insights</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          {CATEGORIES.map((c) => (
            <span key={c}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border cursor-pointer transition-all ${
                c === "All" ? "bg-blue-700 text-white border-blue-700" : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
              }`}>
              {c}
            </span>
          ))}
        </div>

        {hasPosts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-44 bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center">
                  {post.coverImage
                    ? <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    : <BookOpen className="w-10 h-10 text-slate-300" />
                  }
                </div>
                <div className="p-5">
                  <h2 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">{post.title}</h2>
                  {post.excerpt && <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                    <span>{post.author || "Walley Editorial"}</span>
                    {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <>
            {/* Featured post */}
            <div className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-[10px] font-bold bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full uppercase tracking-wider">Editor's Pick</div>
              <span className="inline-block text-[10px] font-bold bg-blue-600/50 border border-blue-400/30 text-blue-100 px-2.5 py-0.5 rounded-full mb-4">Buying Guide</span>
              <h2 className="text-xl sm:text-2xl font-extrabold mb-3 max-w-2xl leading-snug">{FALLBACK_POSTS[0].title}</h2>
              <p className="text-blue-200 text-sm leading-relaxed mb-5 max-w-xl">{FALLBACK_POSTS[0].excerpt}</p>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1.5 text-blue-300 text-xs">
                  <Clock className="w-3.5 h-3.5" /> {FALLBACK_POSTS[0].readTime} read
                </div>
                <span className="text-blue-500 text-xs">by Walley Editorial</span>
              </div>
              <span className="inline-flex items-center gap-2 h-11 px-6 bg-white text-blue-800 hover:bg-blue-50 font-bold text-sm rounded-xl transition-all cursor-pointer">
                Read Article <ArrowRight className="w-4 h-4" />
              </span>
            </div>

            {/* Grid */}
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-gray-900 text-lg">Popular Articles</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {FALLBACK_POSTS.slice(1).map((post) => (
                <div key={post.slug}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group cursor-pointer">
                  <div className="h-40 bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{post.category}</span>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mt-2 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                      <span className="text-blue-600 font-semibold flex items-center gap-0.5">Read <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-3xl p-7 text-center text-white">
          <p className="font-bold text-lg mb-1">Want us to cover a specific topic?</p>
          <p className="text-blue-200 text-sm mb-5">Send your suggestions — our editorial team reads every one.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 h-11 px-6 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all">
            Suggest a Topic <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
