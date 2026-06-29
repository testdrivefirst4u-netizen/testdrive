"use client";
import { useState, useEffect, useCallback } from "react";
import {
  CalendarClock, Phone, Loader2, AlertCircle, Clock, CheckCircle2,
  Download, Building2, ChevronDown, ChevronUp, Filter,
} from "lucide-react";

function isOverdue(d: string) {
  const date = new Date(d);
  return date < new Date() && date.toDateString() !== new Date().toDateString();
}
function isToday(d: string) {
  return new Date(d).toDateString() === new Date().toDateString();
}
function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusPill({ scheduledAt, status }: { scheduledAt: string; status: string }) {
  if (status === "done")
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Done</span>;
  if (isOverdue(scheduledAt))
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 animate-pulse">Overdue</span>;
  if (isToday(scheduledAt))
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Today</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Upcoming</span>;
}

interface FollowUp {
  id: string; scheduledAt: string; note: string | null;
  status: string; outcome: string | null;
  lead: { name: string; mobile: string; vehicleName: string | null; city: string | null; status: string };
}
interface DealerGroup {
  dealer: { id: string; name: string; city: string; brand: { name: string } | null };
  followUps: FollowUp[];
}

function DealerSection({ group, defaultOpen }: { group: DealerGroup; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  const pending      = group.followUps.filter(f => f.status === "pending");
  const overdueItems = pending.filter(f => isOverdue(f.scheduledAt));
  const todayItems   = pending.filter(f => isToday(f.scheduledAt));

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Dealer header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{group.dealer.name}</p>
            <p className="text-xs text-gray-400">
              {group.dealer.brand?.name && `${group.dealer.brand.name} · `}{group.dealer.city}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {overdueItems.length > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">
              {overdueItems.length} overdue
            </span>
          )}
          {todayItems.length > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              {todayItems.length} today
            </span>
          )}
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {group.followUps.length} total
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="text-left px-4 py-2.5">Lead</th>
                  <th className="text-left px-4 py-2.5">Mobile</th>
                  <th className="text-left px-4 py-2.5">Vehicle</th>
                  <th className="text-left px-4 py-2.5">Scheduled</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-left px-4 py-2.5">Note</th>
                  <th className="text-left px-4 py-2.5">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {group.followUps.map(fu => (
                  <tr key={fu.id} className={`border-t border-gray-50 hover:bg-gray-50 transition-colors ${
                    fu.status === "pending" && isOverdue(fu.scheduledAt) ? "bg-red-50/40" :
                    fu.status === "pending" && isToday(fu.scheduledAt)   ? "bg-amber-50/40" : ""
                  }`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{fu.lead.name}</p>
                      {fu.lead.city && <p className="text-gray-400 text-[10px]">{fu.lead.city}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`tel:${fu.lead.mobile}`} className="text-blue-600 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />{fu.lead.mobile}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{fu.lead.vehicleName ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{fmtDate(fu.scheduledAt)}</td>
                    <td className="px-4 py-3">
                      <StatusPill scheduledAt={fu.scheduledAt} status={fu.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{fu.note ?? "—"}</td>
                    <td className="px-4 py-3 text-emerald-700 max-w-[160px] truncate">{fu.outcome ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Per-dealer export */}
          <div className="px-4 py-3 border-t border-gray-50 flex justify-end">
            <a
              href={`/api/admin/followups/export?dealerId=${group.dealer.id}`}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export {group.dealer.name} CSV
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminFollowUpsPage() {
  const [groups,   setGroups]   = useState<DealerGroup[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [filter,   setFilter]   = useState<"all" | "pending" | "done">("all");
  const [dealerF,  setDealerF]  = useState("");
  const [dealers,  setDealers]  = useState<{ id: string; name: string }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (filter !== "all") p.set("status", filter);
    if (dealerF) p.set("dealerId", dealerF);
    const res  = await fetch(`/api/admin/followups?${p}`);
    const data = await res.json();
    setGroups(data.groups ?? []);
    setTotal(data.total  ?? 0);
    setLoading(false);
  }, [filter, dealerF]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    fetch("/api/admin/dealers?limit=200")
      .then(r => r.json())
      .then(d => setDealers((d.dealers ?? []).map((x: any) => ({ id: x.id, name: x.name }))));
  }, []);

  const overdueTot = groups.flatMap(g => g.followUps).filter(f => f.status === "pending" && isOverdue(f.scheduledAt)).length;
  const todayTot   = groups.flatMap(g => g.followUps).filter(f => f.status === "pending" && isToday(f.scheduledAt)).length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dealer Follow-ups</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} follow-ups across all dealers</p>
        </div>
        <a
          href={`/api/admin/followups/export${dealerF ? `?dealerId=${dealerF}` : ""}`}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          <Download className="w-4 h-4" />
          Export All CSV
        </a>
      </div>

      {/* Summary banners */}
      {(overdueTot > 0 || todayTot > 0) && (
        <div className="flex flex-wrap gap-3">
          {overdueTot > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-2.5 rounded-2xl">
              <AlertCircle className="w-3.5 h-3.5" />
              {overdueTot} overdue across all dealers
            </div>
          )}
          {todayTot > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-2.5 rounded-2xl">
              <Clock className="w-3.5 h-3.5" />
              {todayTot} due today
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select value={filter} onChange={e => setFilter(e.target.value as any)}
            className="text-sm text-gray-700 bg-transparent outline-none">
            <option value="all">All Status</option>
            <option value="pending">Pending Only</option>
            <option value="done">Done Only</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2">
          <Building2 className="w-3.5 h-3.5 text-gray-400" />
          <select value={dealerF} onChange={e => setDealerF(e.target.value)}
            className="text-sm text-gray-700 bg-transparent outline-none max-w-[200px]">
            <option value="">All Dealers</option>
            {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        {(filter !== "all" || dealerF) && (
          <button onClick={() => { setFilter("all"); setDealerF(""); }}
            className="text-xs text-gray-400 hover:text-gray-700 underline">
            Clear filters
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-semibold">No follow-ups found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g, i) => (
            <DealerSection key={g.dealer.id} group={g} defaultOpen={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
