import {
  Car, Tag, Newspaper, Users, BookOpen, Eye, Plus,
  TrendingUp, ChevronRight, ArrowUpRight, Clock,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";

async function getStats() {
  const [vehicles, brands, news, blogs, users, publishedVehicles] = await Promise.all([
    prisma.vehicle.count(),
    prisma.brand.count(),
    prisma.news.count(),
    prisma.blog.count(),
    prisma.user.count(),
    prisma.vehicle.count({ where: { status: "PUBLISHED" } }),
  ]);
  return { vehicles, brands, news, blogs, users, publishedVehicles };
}

async function getRecentVehicles() {
  return prisma.vehicle.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { brand: { select: { name: true } } },
  });
}

async function getRecentNews() {
  return prisma.news.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, status: true, createdAt: true },
  });
}

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default async function AdminDashboard() {
  const [stats, recentVehicles, recentNews] = await Promise.all([
    getStats(),
    getRecentVehicles(),
    getRecentNews(),
  ]);

  const statCards = [
    {
      label: "Total Vehicles", value: stats.vehicles,
      sub: `${stats.publishedVehicles} published`,
      icon: Car, href: "/admin/vehicles",
      gradient: "from-blue-500 to-blue-700",
      glow: "shadow-blue-500/20",
    },
    {
      label: "Brands", value: stats.brands,
      sub: "Registered manufacturers",
      icon: Tag, href: "/admin/brands",
      gradient: "from-purple-500 to-violet-700",
      glow: "shadow-purple-500/20",
    },
    {
      label: "News Articles", value: stats.news,
      sub: "Total published",
      icon: Newspaper, href: "/admin/news",
      gradient: "from-orange-500 to-red-600",
      glow: "shadow-orange-500/20",
    },
    {
      label: "Blog Posts", value: stats.blogs,
      sub: "Content pieces",
      icon: BookOpen, href: "/admin/blogs",
      gradient: "from-emerald-500 to-teal-700",
      glow: "shadow-emerald-500/20",
    },
    {
      label: "Users", value: stats.users,
      sub: "Registered accounts",
      icon: Users, href: "/admin/users",
      gradient: "from-pink-500 to-rose-700",
      glow: "shadow-pink-500/20",
    },
    {
      label: "Published", value: stats.publishedVehicles,
      sub: `of ${stats.vehicles} total`,
      icon: Eye, href: "/admin/vehicles?status=PUBLISHED",
      gradient: "from-teal-500 to-cyan-700",
      glow: "shadow-teal-500/20",
    },
  ];

  const quickActions = [
    { label: "Add Vehicle", href: "/admin/vehicles/new", icon: Car,       gradient: "from-blue-500 to-blue-700"   },
    { label: "Add Brand",   href: "/admin/brands/new",   icon: Tag,       gradient: "from-purple-500 to-violet-700"},
    { label: "Add News",    href: "/admin/news/new",     icon: Newspaper, gradient: "from-orange-500 to-red-600"  },
    { label: "Add Blog",    href: "/admin/blogs/new",    icon: BookOpen,  gradient: "from-emerald-500 to-teal-700"},
    { label: "Add User",    href: "/admin/users/new",    icon: Users,     gradient: "from-pink-500 to-rose-700"   },
  ];

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back to Walley CMS</p>
        </div>
        <Link href="/admin/vehicles/new"
          className="flex items-center gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}
              className="group bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-blue-100 transition-all duration-200 block">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} shadow-lg ${s.glow} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</p>
              <p className="text-[11px] font-semibold text-gray-700 mt-0.5 leading-tight">{s.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{s.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent Vehicles */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <Car className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <h2 className="font-bold text-gray-800 text-sm">Recent Vehicles</h2>
            </div>
            <Link href="/admin/vehicles"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentVehicles.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">No vehicles yet</div>
            ) : recentVehicles.map((v) => (
              <Link key={v.id} href={`/admin/vehicles/${v.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 group transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors truncate">{v.name}</p>
                    <p className="text-[10px] text-gray-400">{v.brand.name} · {v.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    v.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" :
                    v.status === "DRAFT"     ? "bg-amber-50 text-amber-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {v.status}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent News */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                <Newspaper className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <h2 className="font-bold text-gray-800 text-sm">Recent News</h2>
            </div>
            <Link href="/admin/news"
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentNews.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">No news yet</div>
            ) : recentNews.map((n) => (
              <Link key={n.id} href={`/admin/news/${n.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 group transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center flex-shrink-0">
                    <Newspaper className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-1">{n.title}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(new Date(n.createdAt))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    n.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {n.status}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-gray-800 text-sm">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.label} href={a.href}
                className="group flex flex-col items-center gap-2.5 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 transition-colors text-center">{a.label}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
