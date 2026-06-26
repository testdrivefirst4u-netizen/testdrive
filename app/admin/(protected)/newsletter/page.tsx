import prisma from "@/lib/prisma";
import { Mail, Users, UserX, Download, TrendingUp } from "lucide-react";
import NewsletterClient from "./newsletter-client";

async function getStats() {
  const [total, active, unsubscribed, thisMonth, recent] = await Promise.all([
    prisma.newsletterSubscriber.count(),
    prisma.newsletterSubscriber.count({ where: { status: "active" } }),
    prisma.newsletterSubscriber.count({ where: { status: "unsubscribed" } }),
    prisma.newsletterSubscriber.count({
      where: { subscribedAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
      take: 50,
    }),
  ]);
  return { total, active, unsubscribed, thisMonth, recent };
}

export default async function NewsletterPage() {
  const { total, active, unsubscribed, thisMonth, recent } = await getStats();

  const cards = [
    { label: "Total Subscribers", value: total,        icon: Users,       color: "bg-blue-50 text-blue-600"   },
    { label: "Active",            value: active,       icon: Mail,        color: "bg-emerald-50 text-emerald-600" },
    { label: "Unsubscribed",      value: unsubscribed, icon: UserX,       color: "bg-red-50 text-red-500"     },
    { label: "This Month",        value: thisMonth,    icon: TrendingUp,  color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage email subscribers</p>
        </div>
        <a
          href="/api/admin/newsletter/export"
          className="flex items-center gap-2 h-9 px-4 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <NewsletterClient subscribers={recent as any} />
    </div>
  );
}
