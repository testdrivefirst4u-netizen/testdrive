import {
  Car, Tag, Newspaper, Users, BookOpen, Inbox,
  TrendingUp, ChevronRight, ArrowUpRight, Clock,
  Phone, Mail, MapPin, AlertCircle, BarChart3, UserCheck,
  Send, Eye, FileBarChart,
} from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { VehicleTypeChart } from "@/components/admin/vehicle-type-chart";

async function getStats() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const today   = new Date(); today.setHours(0, 0, 0, 0);

  const [
    vehicles, brands, news, blogs, users, publishedVehicles,
    leads, newLeads, convertedLeads, unassignedLeads,
    leadsThisWeek, leadsToday, contactedLeads,
    draftVehicles, newsletterSubscribers, viewsAgg,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.brand.count(),
    prisma.news.count(),
    prisma.blog.count(),
    prisma.user.count(),
    prisma.vehicle.count({ where: { status: "PUBLISHED" } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { status: "new" } }),
    prisma.lead.count({ where: { status: "converted" } }),
    prisma.lead.count({ where: { dealerId: null } as any }),
    prisma.lead.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.lead.count({ where: { createdAt: { gte: today  } } }),
    prisma.lead.count({ where: { status: "contacted" } }),
    prisma.vehicle.count({ where: { status: "DRAFT" } }),
    prisma.newsletterSubscriber.count({ where: { status: "active" } }),
    prisma.vehicle.aggregate({ _sum: { viewCount: true } }),
  ]);

  return {
    vehicles, brands, news, blogs, users, publishedVehicles,
    leads, newLeads, convertedLeads, unassignedLeads,
    leadsThisWeek, leadsToday, contactedLeads,
    draftVehicles, newsletterSubscribers,
    totalViews: viewsAgg._sum.viewCount ?? 0,
    conversionRate: leads > 0 ? Math.round((convertedLeads / leads) * 100) : 0,
  };
}

async function getVehiclesByType() {
  const types = ["CAR", "BIKE", "SCOOTER", "EV", "COMMERCIAL"] as const;
  const counts = await Promise.all(
    types.map((t) => prisma.vehicle.count({ where: { type: t } }))
  );
  return types.map((type, i) => ({ type, count: counts[i] }));
}

async function getLeadsBySource() {
  const sources = ["offer_popup", "test_drive", "contact_form", "compare"];
  const counts  = await Promise.all(sources.map(s => prisma.lead.count({ where: { source: s } })));
  return sources.map((s, i) => ({ source: s, count: counts[i] }));
}

async function getDealerPerformance() {
  const dealers = await prisma.dealer.findMany({
    where:  { status: "ACTIVE" },
    select: { id: true, name: true, city: true, todayLeadCount: true, maxLeadsPerDay: true, _count: { select: { leads: true } } },
  });
  // MongoDB doesn't support _count orderBy — sort in JS
  return dealers.sort((a, b) => b._count.leads - a._count.leads).slice(0, 5);
}

async function getRecentLeads() {
  return prisma.lead.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { brand: { select: { name: true } }, dealer: { select: { name: true } } },
  });
}

async function getRecentVehicles() {
  return prisma.vehicle.findMany({
    take: 5, orderBy: { createdAt: "desc" },
    include: { brand: { select: { name: true } } },
  });
}

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  contact_form: { label: "Contact",    color: "bg-blue-50 text-blue-700"    },
  test_drive:   { label: "Test Drive", color: "bg-purple-50 text-purple-700"},
  compare:      { label: "Compare",    color: "bg-pink-50 text-pink-700"    },
  offer_popup:  { label: "Offer Popup",color: "bg-orange-50 text-orange-700"},
};

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-amber-50 text-amber-700",
  contacted: "bg-blue-50 text-blue-700",
  converted: "bg-emerald-50 text-emerald-700",
  lost:      "bg-red-50 text-red-500",
};

export default async function AdminDashboard() {
  const [stats, leadsBySource, dealerPerf, recentLeads, recentVehicles, vehiclesByType] = await Promise.all([
    getStats(),
    getLeadsBySource(),
    getDealerPerformance(),
    getRecentLeads(),
    getRecentVehicles(),
    getVehiclesByType(),
  ]);

  const totalLeadsBySource = leadsBySource.reduce((a, s) => a + s.count, 0) || 1;

  const statCards = [
    { label: "Total Vehicles",   value: stats.vehicles,              sub: `${stats.publishedVehicles} published · ${stats.draftVehicles} draft`, icon: Car,          href: "/admin/vehicles",    gradient: "from-blue-500 to-blue-700",     glow: "shadow-blue-500/20"    },
    { label: "Brands",           value: stats.brands,                sub: "Registered manufacturers",                                             icon: Tag,          href: "/admin/brands",      gradient: "from-purple-500 to-violet-700", glow: "shadow-purple-500/20"  },
    { label: "Total Leads",      value: stats.leads,                 sub: `${stats.newLeads} new`,                                                icon: Inbox,        href: "/admin/leads",       gradient: "from-amber-500 to-orange-600",  glow: "shadow-amber-500/20"   },
    { label: "News Articles",    value: stats.news,                  sub: "Total published",                                                      icon: Newspaper,    href: "/admin/news",        gradient: "from-orange-500 to-red-600",    glow: "shadow-orange-500/20"  },
    { label: "Newsletter",       value: stats.newsletterSubscribers, sub: "Active subscribers",                                                   icon: Send,         href: "/admin/newsletter",  gradient: "from-teal-500 to-cyan-700",     glow: "shadow-teal-500/20"    },
    { label: "Total Views",      value: stats.totalViews,            sub: "Across all vehicles",                                                  icon: Eye,          href: "/admin/vehicles",    gradient: "from-pink-500 to-rose-700",     glow: "shadow-pink-500/20"    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back to Walley CMS</p>
        </div>
        <div className="flex items-center gap-2">
          {stats.unassignedLeads > 0 && (
            <Link href="/admin/leads?unassigned=1"
              className="flex items-center gap-2 h-9 px-4 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-all">
              <AlertCircle className="w-4 h-4" /> {stats.unassignedLeads} Unassigned
            </Link>
          )}
          {stats.newLeads > 0 && (
            <Link href="/admin/leads?status=new"
              className="flex items-center gap-2 h-9 px-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-all">
              <Inbox className="w-4 h-4" /> {stats.newLeads} New Leads
            </Link>
          )}
        </div>
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

      {/* Lead analytics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Today",       value: stats.leadsToday,      color: "text-blue-600",   bg: "bg-blue-50"    },
          { label: "This Week",   value: stats.leadsThisWeek,   color: "text-purple-600", bg: "bg-purple-50"  },
          { label: "Converted",   value: stats.convertedLeads,  color: "text-emerald-600",bg: "bg-emerald-50" },
          { label: "Conv. Rate",  value: `${stats.conversionRate}%`, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(m => (
          <div key={m.label} className={`${m.bg} rounded-2xl p-4`}>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Vehicle Type Breakdown + Extra Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Vehicle by type bar chart */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileBarChart className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-gray-800 text-sm">Vehicles by Type</h2>
          </div>
          <VehicleTypeChart data={vehiclesByType} />
        </div>

        {/* Quick stats grid */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <h2 className="font-bold text-gray-800 text-sm">Inventory Snapshot</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Published",    value: stats.publishedVehicles,      color: "bg-emerald-50 text-emerald-700" },
              { label: "Drafts",       value: stats.draftVehicles,          color: "bg-amber-50 text-amber-700"    },
              { label: "Subscribers",  value: stats.newsletterSubscribers,  color: "bg-teal-50 text-teal-700"      },
              { label: "Total Views",  value: stats.totalViews.toLocaleString(), color: "bg-blue-50 text-blue-700" },
              { label: "Blog Posts",   value: stats.blogs,                  color: "bg-indigo-50 text-indigo-700"  },
              { label: "Contacted",    value: stats.contactedLeads,         color: "bg-pink-50 text-pink-700"      },
            ].map((item) => (
              <div key={item.label} className={`${item.color} rounded-xl p-3`}>
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-[11px] font-medium mt-0.5 opacity-80">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Source Attribution + Dealer Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Source attribution */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-gray-800 text-sm">Lead Sources</h2>
          </div>
          <div className="space-y-3">
            {leadsBySource.sort((a, b) => b.count - a.count).map(({ source, count }) => {
              const src = SOURCE_LABELS[source] ?? { label: source, color: "bg-gray-100 text-gray-600" };
              const pct = Math.round((count / totalLeadsBySource) * 100);
              return (
                <div key={source}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${src.color}`}>{src.label}</span>
                    <span className="text-xs font-bold text-gray-700">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top dealer performance */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-gray-800 text-sm">Top Dealers</h2>
            </div>
            <Link href="/admin/dealers" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Manage →
            </Link>
          </div>
          {dealerPerf.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No active dealers yet</p>
          ) : (
            <div className="space-y-2">
              {dealerPerf.map((d, i) => (
                <div key={d.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-[10px] font-bold text-gray-400 w-4 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{d.name}</p>
                    <p className="text-[10px] text-gray-400">{d.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{d._count.leads}</p>
                    <p className="text-[10px] text-gray-400">leads</p>
                  </div>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(100, (d.todayLeadCount / d.maxLeadsPerDay) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
              <Inbox className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h2 className="font-bold text-gray-800 text-sm">Recent Leads</h2>
            {stats.newLeads > 0 && (
              <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">{stats.newLeads} new</span>
            )}
          </div>
          <Link href="/admin/leads"
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentLeads.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No leads yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-slate-50/60">
                  <th className="text-left px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Vehicle</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Source</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Dealer</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Time</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentLeads.map((lead) => {
                  const src = SOURCE_LABELS[lead.source] ?? { label: lead.source, color: "bg-gray-100 text-gray-600" };
                  const statusColor = STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600";
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-gray-800 text-sm">{lead.name}</p>
                        {lead.city && (
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {lead.city}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-3 hidden sm:table-cell">
                        <a href={`tel:${lead.mobile}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600">
                          <Phone className="w-3 h-3" /> {lead.mobile}
                        </a>
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 truncate max-w-[160px]">
                            <Mail className="w-3 h-3" /> {lead.email}
                          </a>
                        )}
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <p className="text-xs text-gray-600 truncate max-w-[140px]">{lead.vehicleName || "—"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${src.color}`}>{src.label}</span>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        {lead.dealer ? (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{lead.dealer.name}</span>
                        ) : (
                          <span className="text-[10px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor}`}>{lead.status}</span>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {timeAgo(new Date(lead.createdAt))}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <Link href={`/admin/leads/${lead.id}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                          View <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                }`}>{v.status}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <h2 className="font-bold text-gray-800 text-sm">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: "Add Vehicle",   href: "/admin/vehicles/new", icon: Car,      gradient: "from-blue-500 to-blue-700"   },
            { label: "Add Brand",     href: "/admin/brands/new",   icon: Tag,      gradient: "from-purple-500 to-violet-700"},
            { label: "View Leads",    href: "/admin/leads",        icon: Inbox,    gradient: "from-amber-500 to-orange-600" },
            { label: "Add News",      href: "/admin/news/new",     icon: Newspaper,gradient: "from-orange-500 to-red-600"  },
            { label: "Manage Dealers",href: "/admin/dealers",      icon: UserCheck,gradient: "from-emerald-500 to-teal-700"},
          ].map((a) => {
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
