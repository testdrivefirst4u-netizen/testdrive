"use client";
import { useState, useEffect } from "react";
import { Users, Car, Building2, CalendarClock, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  assigned: "bg-indigo-100 text-indigo-700",
  contacted: "bg-yellow-100 text-yellow-700",
  interested: "bg-orange-100 text-orange-700",
  follow_up: "bg-purple-100 text-purple-700",
  test_drive_scheduled: "bg-cyan-100 text-cyan-700",
  booked: "bg-green-100 text-green-700",
  delivered: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function CrmDashboardPage() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/crm/dashboard").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
    </div>
  );

  const cards = [
    { label: "Total Leads",       value: data.totalLeads,      icon: Users,         color: "bg-blue-50 text-blue-600" },
    { label: "Today's Leads",     value: data.todayLeads,      icon: TrendingUp,    color: "bg-green-50 text-green-600" },
    { label: "This Month",        value: data.monthLeads,      icon: Car,           color: "bg-purple-50 text-purple-600" },
    { label: "Unassigned",        value: data.unassigned,      icon: AlertCircle,   color: "bg-red-50 text-red-600" },
    { label: "Active Dealers",    value: data.activeDealers,   icon: Building2,     color: "bg-indigo-50 text-indigo-600" },
    { label: "Pending Follow-ups",value: data.pendingFollowUps,icon: CalendarClock, color: "bg-yellow-50 text-yellow-600" },
    { label: "Overdue Follow-ups",value: data.overdueFollowUps,icon: AlertCircle,   color: "bg-orange-50 text-orange-600" },
    { label: "Total Dealers",     value: data.totalDealers,    icon: Building2,     color: "bg-gray-50 text-gray-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">CRM Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Lead management overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      {data.byStatus && Object.keys(data.byStatus).length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Leads by Status</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.byStatus as Record<string, number>)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => (
                <div key={status} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
                  <span className="capitalize">{status.replace(/_/g, " ")}</span>
                  <span className="opacity-70">({count})</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
