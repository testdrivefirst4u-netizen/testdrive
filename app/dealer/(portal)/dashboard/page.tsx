import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, Car, TrendingUp, PhoneCall, CheckCircle, CalendarClock, AlertCircle, Clock, ArrowRight } from "lucide-react";

export default async function DealerDashboardPage() {
  const session = await dealerAuth();
  const userId  = (session?.user as any)?.id as string | undefined;

  type DealerInfo = { id: string; name: string; city: string; brandId: string };
  let dealer: DealerInfo | null = null;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        adminDealer: { select: { id: true, name: true, city: true, brandId: true } },
        dealer:      { select: { id: true, name: true, city: true, brandId: true } },
      },
    });
    const raw = user?.adminDealer ?? user?.dealer;
    if (raw) dealer = { id: raw.id, name: raw.name, city: raw.city, brandId: raw.brandId };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

  let total = 0, todayCount = 0, newCount = 0, contactedCount = 0, convertedCount = 0;
  let recentLeads:    any[] = [];
  let overdueFollowUps: any[] = [];
  let todayFollowUps:   any[] = [];
  let overdueCount = 0, todayFuCount = 0, upcomingCount = 0;

  if (dealer?.brandId) {
    const base: any = {
      OR: [
        { dealerId: dealer.id },
        { brandId: dealer.brandId, dealerId: null },
      ],
    };

    [total, todayCount, newCount, contactedCount, convertedCount] = await Promise.all([
      prisma.lead.count({ where: base }),
      prisma.lead.count({ where: { ...base, createdAt: { gte: today } } }),
      prisma.lead.count({ where: { ...base, status: "new" } }),
      prisma.lead.count({ where: { ...base, status: "contacted" } }),
      prisma.lead.count({ where: { ...base, status: "converted" } }),
    ]);

    recentLeads = await prisma.lead.findMany({
      where: base,
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, mobile: true, vehicleName: true, status: true, createdAt: true },
    });

    const leadFilter = {
      OR: [
        { dealerId: dealer.id },
        { brandId: dealer.brandId, dealerId: null },
      ],
    };

    [overdueCount, todayFuCount, upcomingCount] = await Promise.all([
      prisma.leadFollowUp.count({
        where: { status: "pending", scheduledAt: { lt: today }, lead: leadFilter },
      }),
      prisma.leadFollowUp.count({
        where: { status: "pending", scheduledAt: { gte: today, lte: todayEnd }, lead: leadFilter },
      }),
      prisma.leadFollowUp.count({
        where: { status: "pending", scheduledAt: { gt: todayEnd }, lead: leadFilter },
      }),
    ]);

    // Overdue follow-ups (top 3)
    overdueFollowUps = await prisma.leadFollowUp.findMany({
      where: { status: "pending", scheduledAt: { lt: today }, lead: leadFilter },
      orderBy: { scheduledAt: "asc" },
      take: 3,
      include: { lead: { select: { name: true, mobile: true, vehicleName: true } } },
    });

    // Today's follow-ups (top 5)
    todayFollowUps = await prisma.leadFollowUp.findMany({
      where: { status: "pending", scheduledAt: { gte: today, lte: todayEnd }, lead: leadFilter },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { lead: { select: { name: true, mobile: true, vehicleName: true } } },
    });
  }

  const STATUS_COLORS: Record<string, string> = {
    new:       "bg-amber-100 text-amber-700",
    contacted: "bg-blue-100 text-blue-700",
    converted: "bg-emerald-100 text-emerald-700",
    lost:      "bg-red-100 text-red-600",
  };

  const leadCards = [
    { label: "Total Leads",  value: total,          icon: Car,         color: "bg-blue-50 text-blue-600"     },
    { label: "Today",        value: todayCount,     icon: TrendingUp,  color: "bg-green-50 text-green-600"   },
    { label: "New",          value: newCount,       icon: Users,       color: "bg-amber-50 text-amber-600"   },
    { label: "Contacted",    value: contactedCount, icon: PhoneCall,   color: "bg-purple-50 text-purple-600" },
    { label: "Converted",    value: convertedCount, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600"},
  ];

  function fmtTime(d: Date | string) {
    return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {dealer ? dealer.name : "Dashboard"}
        </h1>
        {dealer?.city && <p className="text-sm text-gray-500 mt-0.5">{dealer.city}</p>}
        {!dealer && (
          <p className="text-sm text-amber-600 mt-1 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 inline-block">
            No dealer profile linked to your account yet. Contact your admin.
          </p>
        )}
      </div>

      {/* Overdue alert banner */}
      {overdueCount > 0 && (
        <Link href="/dealer/follow-ups?filter=overdue"
          className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 hover:bg-red-100 transition-colors">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-sm font-bold text-red-700">
              {overdueCount} overdue follow-up{overdueCount > 1 ? "s" : ""} — needs immediate attention
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-red-400 shrink-0" />
        </Link>
      )}

      {/* Lead stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {leadCards.map(c => (
          <div key={c.label} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Follow-up summary cards */}
      {dealer && (
        <div className="grid grid-cols-3 gap-3">
          <Link href="/dealer/follow-ups"
            className={`rounded-2xl border p-4 flex flex-col gap-1 transition-colors hover:shadow-sm ${
              overdueCount > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
            }`}>
            <AlertCircle className={`w-4 h-4 ${overdueCount > 0 ? "text-red-500" : "text-gray-300"}`} />
            <p className={`text-2xl font-bold ${overdueCount > 0 ? "text-red-600" : "text-gray-900"}`}>{overdueCount}</p>
            <p className="text-xs text-gray-500">Overdue</p>
          </Link>
          <Link href="/dealer/follow-ups"
            className={`rounded-2xl border p-4 flex flex-col gap-1 transition-colors hover:shadow-sm ${
              todayFuCount > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"
            }`}>
            <Clock className={`w-4 h-4 ${todayFuCount > 0 ? "text-amber-500" : "text-gray-300"}`} />
            <p className={`text-2xl font-bold ${todayFuCount > 0 ? "text-amber-600" : "text-gray-900"}`}>{todayFuCount}</p>
            <p className="text-xs text-gray-500">Due Today</p>
          </Link>
          <Link href="/dealer/follow-ups"
            className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-1 hover:shadow-sm transition-colors">
            <CalendarClock className="w-4 h-4 text-blue-400" />
            <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
            <p className="text-xs text-gray-500">Upcoming</p>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Today's follow-ups */}
        {dealer && (todayFollowUps.length > 0 || overdueFollowUps.length > 0) && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Today&apos;s Calls
              </h2>
              <Link href="/dealer/follow-ups" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {overdueFollowUps.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-red-500 mb-2">Overdue</p>
                <div className="space-y-2">
                  {overdueFollowUps.map((fu: any) => (
                    <div key={fu.id} className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-xl border border-red-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{fu.lead.name}</p>
                        <p className="text-xs text-gray-400">
                          {fu.lead.mobile}{fu.note ? ` · ${fu.note}` : ""}
                        </p>
                      </div>
                      <a href={`tel:${fu.lead.mobile}`}
                        className="text-[10px] font-bold bg-red-600 text-white px-2.5 py-1.5 rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap">
                        Call Now
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {todayFollowUps.length > 0 && (
              <div>
                {overdueFollowUps.length > 0 && (
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 mb-2">Scheduled Today</p>
                )}
                <div className="space-y-2">
                  {todayFollowUps.map((fu: any) => (
                    <div key={fu.id} className="flex items-center justify-between py-2 px-3 bg-amber-50 rounded-xl border border-amber-100">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{fu.lead.name}</p>
                        <p className="text-xs text-gray-400">
                          {fmtTime(fu.scheduledAt)}{fu.note ? ` · ${fu.note}` : ""}
                        </p>
                      </div>
                      <a href={`tel:${fu.lead.mobile}`}
                        className="text-[10px] font-bold bg-amber-500 text-white px-2.5 py-1.5 rounded-lg hover:bg-amber-600 transition-colors whitespace-nowrap">
                        Call
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent leads */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Recent Leads</h2>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No leads yet for your brand</p>
          ) : (
            <div className="space-y-3">
              {recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-400">
                      {lead.mobile}{lead.vehicleName ? ` · ${lead.vehicleName}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {lead.status}
                    </span>
                    <span className="text-[10px] text-gray-400">{new Date(lead.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
