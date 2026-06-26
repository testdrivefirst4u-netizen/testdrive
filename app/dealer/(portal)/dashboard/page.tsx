import { dealerAuth } from "@/lib/auth-dealer";
import prisma from "@/lib/prisma";
import { Users, Car, TrendingUp, PhoneCall, CheckCircle } from "lucide-react";

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

  let total = 0, todayCount = 0, newCount = 0, contactedCount = 0, convertedCount = 0;
  let recentLeads: any[] = [];

  if (dealer?.brandId) {
    // Filter by dealerId so each dealer only sees their own assigned leads.
    // This also means inactive dealers see only previously assigned leads (no new ones).
    const base = { dealerId: dealer.id };
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
  }

  const STATUS_COLORS: Record<string, string> = {
    new:       "bg-amber-100 text-amber-700",
    contacted: "bg-blue-100 text-blue-700",
    converted: "bg-emerald-100 text-emerald-700",
    lost:      "bg-red-100 text-red-600",
  };

  const cards = [
    { label: "Total Leads",  value: total,          icon: Car,         color: "bg-blue-50 text-blue-600"     },
    { label: "Today",        value: todayCount,     icon: TrendingUp,  color: "bg-green-50 text-green-600"   },
    { label: "New",          value: newCount,       icon: Users,       color: "bg-amber-50 text-amber-600"   },
    { label: "Contacted",    value: contactedCount, icon: PhoneCall,   color: "bg-purple-50 text-purple-600" },
    { label: "Converted",    value: convertedCount, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600"},
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {dealer ? dealer.name : "Dashboard"}
        </h1>
        {dealer?.city && (
          <p className="text-sm text-gray-500 mt-0.5">{dealer.city}</p>
        )}
        {!dealer && (
          <p className="text-sm text-amber-600 mt-1 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 inline-block">
            No dealer profile linked to your account yet. Contact your admin.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4">Recent Leads</h2>
        {recentLeads.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No leads yet for your brand</p>
        ) : (
          <div className="space-y-3">
            {recentLeads.map(lead => (
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
  );
}
