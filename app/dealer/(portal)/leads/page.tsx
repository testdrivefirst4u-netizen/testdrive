"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Search, Phone, MapPin, ChevronLeft, ChevronRight, Loader2, X,
  Save, MessageSquare, CalendarClock, Plus, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  converted: "bg-emerald-100 text-emerald-700",
  lost:      "bg-red-100 text-red-600",
};

const STATUSES = ["new", "contacted", "converted", "lost"];

function formatDate(d: string | Date) {
  const date = new Date(d);
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function isOverdue(d: string | Date) {
  return new Date(d) < new Date() ;
}

function isToday(d: string | Date) {
  const date = new Date(d);
  const now  = new Date();
  return date.toDateString() === now.toDateString();
}

function FollowUpBadge({ scheduledAt, status }: { scheduledAt: string; status: string }) {
  if (status === "done") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
      <CheckCircle2 className="w-2.5 h-2.5" />Done
    </span>
  );
  if (status === "cancelled") return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
      Cancelled
    </span>
  );
  if (isOverdue(scheduledAt)) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
      <AlertCircle className="w-2.5 h-2.5" />Overdue
    </span>
  );
  if (isToday(scheduledAt)) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
      <Clock className="w-2.5 h-2.5" />Today
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
      <CalendarClock className="w-2.5 h-2.5" />Upcoming
    </span>
  );
}

function LeadDrawer({ lead, onClose, onSaved }: { lead: any; onClose: () => void; onSaved: () => void }) {
  const [status,      setStatus]      = useState(lead.status as string);
  const [notes,       setNotes]       = useState((lead.notes as string) ?? "");
  const [saving,      setSaving]      = useState(false);
  const [activeTab,   setActiveTab]   = useState<"details" | "followups">("details");

  // Follow-up state
  const [followUps,   setFollowUps]   = useState<any[]>([]);
  const [fuLoading,   setFuLoading]   = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [fuDate,      setFuDate]      = useState("");
  const [fuNote,      setFuNote]      = useState("");
  const [fuSaving,    setFuSaving]    = useState(false);

  // Mark done state
  const [doneId,     setDoneId]      = useState<string | null>(null);
  const [outcome,    setOutcome]     = useState("");
  const [doneSaving, setDoneSaving]  = useState(false);

  const loadFollowUps = useCallback(async () => {
    setFuLoading(true);
    const res  = await fetch(`/api/dealer/leads/${lead.id}/followups`);
    const data = await res.json();
    setFollowUps(data.followUps ?? []);
    setFuLoading(false);
  }, [lead.id]);

  useEffect(() => {
    if (activeTab === "followups") loadFollowUps();
  }, [activeTab, loadFollowUps]);

  async function saveDetails() {
    setSaving(true);
    await fetch(`/api/dealer/leads/${lead.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    setSaving(false);
    onSaved();
  }

  async function addFollowUp() {
    if (!fuDate) return;
    setFuSaving(true);
    await fetch(`/api/dealer/leads/${lead.id}/followups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: fuDate, note: fuNote }),
    });
    setFuDate(""); setFuNote(""); setShowAddForm(false); setFuSaving(false);
    loadFollowUps();
  }

  async function markDone(fid: string) {
    setDoneSaving(true);
    await fetch(`/api/dealer/followups/${fid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done", outcome }),
    });
    setDoneId(null); setOutcome(""); setDoneSaving(false);
    loadFollowUps();
  }

  async function cancelFollowUp(fid: string) {
    await fetch(`/api/dealer/followups/${fid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    loadFollowUps();
  }

  // Default datetime for new follow-up = tomorrow at 10:00
  const defaultDateTime = (() => {
    const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  })();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-bold text-gray-900">{lead.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{lead.mobile}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-white sticky top-[65px]">
          {(["details", "followups"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-bold capitalize transition-colors relative ${
                activeTab === tab ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
              }`}>
              {tab === "followups" ? "Follow-ups" : "Details"}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t" />}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {activeTab === "details" && (
            <div className="p-5 space-y-5">
              {/* Contact */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-sm">
                <a href={`tel:${lead.mobile}`} className="flex items-center gap-2 text-blue-600 font-semibold">
                  <Phone className="w-3.5 h-3.5" />{lead.mobile}
                </a>
                {lead.email && <p className="text-gray-600 text-xs">{lead.email}</p>}
                {lead.city && (
                  <p className="flex items-center gap-2 text-gray-500 text-xs">
                    <MapPin className="w-3 h-3" />{lead.city}
                  </p>
                )}
              </div>

              {/* Vehicle info */}
              {lead.vehicleName && (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { l: "Vehicle",  v: lead.vehicleName },
                    { l: "Type",     v: lead.vehicleType },
                    { l: "Buy Time", v: lead.buyTime },
                    { l: "Sell Car", v: lead.sellCar },
                  ].filter(i => i.v).map(i => (
                    <div key={i.l} className="bg-gray-50 rounded-xl px-3 py-2 text-xs">
                      <p className="text-gray-400">{i.l}</p>
                      <p className="font-semibold text-gray-800 mt-0.5">{i.v}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Status */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => setStatus(s)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize transition-all ${
                        status === s
                          ? (STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600") + " ring-1 ring-current"
                          : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notes</p>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                  placeholder="Add call notes, follow-up details…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>

              <button onClick={saveDetails} disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Update
              </button>

              {/* Quick shortcut to follow-up tab */}
              <button onClick={() => setActiveTab("followups")}
                className="w-full flex items-center justify-center gap-2 text-xs text-indigo-600 font-bold py-2 rounded-xl border border-indigo-100 hover:bg-indigo-50 transition-colors">
                <CalendarClock className="w-3.5 h-3.5" />
                Schedule a Follow-up Call
              </button>
            </div>
          )}

          {activeTab === "followups" && (
            <div className="p-5 space-y-4">
              {/* Add new follow-up button */}
              {!showAddForm ? (
                <button onClick={() => { setShowAddForm(true); setFuDate(defaultDateTime); }}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-2xl py-3 transition-all">
                  <Plus className="w-4 h-4" />
                  Schedule Follow-up Call
                </button>
              ) : (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">New Follow-up</p>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Date &amp; Time</label>
                    <input type="datetime-local" value={fuDate} onChange={e => setFuDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Note (optional)</label>
                    <input type="text" value={fuNote} onChange={e => setFuNote(e.target.value)}
                      placeholder="e.g. Call about test drive, confirm petrol variant…"
                      className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addFollowUp} disabled={!fuDate || fuSaving}
                      className="flex-1 bg-indigo-600 text-white text-sm font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 hover:bg-indigo-700 transition-colors">
                      {fuSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CalendarClock className="w-3.5 h-3.5" />}
                      Save
                    </button>
                    <button onClick={() => { setShowAddForm(false); setFuDate(""); setFuNote(""); }}
                      className="px-4 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Follow-up timeline */}
              {fuLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                </div>
              ) : followUps.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <CalendarClock className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No follow-ups scheduled yet</p>
                  <p className="text-xs mt-1">Click "Schedule Follow-up Call" above to add one</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Timeline</p>
                  {followUps.map(fu => (
                    <div key={fu.id}
                      className={`rounded-2xl border p-4 space-y-2 ${
                        fu.status === "done"      ? "bg-gray-50 border-gray-100 opacity-70" :
                        fu.status === "cancelled" ? "bg-gray-50 border-gray-100 opacity-50" :
                        isOverdue(fu.scheduledAt) ? "bg-red-50 border-red-100" :
                        isToday(fu.scheduledAt)   ? "bg-amber-50 border-amber-100" :
                        "bg-white border-gray-100"
                      }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-700">{formatDate(fu.scheduledAt)}</p>
                          {fu.note && <p className="text-xs text-gray-500 mt-0.5">{fu.note}</p>}
                          {fu.outcome && (
                            <p className="text-xs text-emerald-700 mt-1 italic">
                              Result: {fu.outcome}
                            </p>
                          )}
                        </div>
                        <FollowUpBadge scheduledAt={fu.scheduledAt} status={fu.status} />
                      </div>

                      {fu.status === "pending" && (
                        doneId === fu.id ? (
                          <div className="space-y-2 pt-1 border-t border-current/10">
                            <input type="text" value={outcome} onChange={e => setOutcome(e.target.value)}
                              placeholder="What happened? (optional)"
                              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400" />
                            <div className="flex gap-2">
                              <button onClick={() => markDone(fu.id)} disabled={doneSaving}
                                className="flex-1 bg-emerald-600 text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-center gap-1 hover:bg-emerald-700 transition-colors disabled:opacity-50">
                                {doneSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                Confirm Done
                              </button>
                              <button onClick={() => { setDoneId(null); setOutcome(""); }}
                                className="px-3 text-xs text-gray-400 hover:text-gray-600">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 pt-1">
                            <button onClick={() => { setDoneId(fu.id); setOutcome(""); }}
                              className="flex-1 text-xs font-bold py-1.5 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />Called — Mark Done
                            </button>
                            <button onClick={() => cancelFollowUp(fu.id)}
                              className="px-3 text-xs text-gray-400 hover:text-red-500 transition-colors">
                              Cancel
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DealerLeadsPage() {
  const [leads,        setLeads]        = useState<any[]>([]);
  const [meta,         setMeta]         = useState<any>({});
  const [dealer,       setDealer]       = useState<any>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading,      setLoading]      = useState(true);
  const [drawer,       setDrawer]       = useState<any>(null);
  const [search,       setSearch]       = useState("");
  const [status,       setStatus]       = useState("");
  const [page,         setPage]         = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: "20", search, ...(status ? { status } : {}) });
    const res  = await fetch(`/api/dealer/leads?${p}`);
    const data = await res.json();
    setLeads(data.leads        ?? []);
    setMeta(data.meta          ?? {});
    setDealer(data.dealer      ?? null);
    setStatusCounts(data.statusCounts ?? {});
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {dealer ? `${dealer.name} — Leads` : "My Leads"}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{meta.total ?? 0} leads assigned to your brand</p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setStatus(""); setPage(1); }}
          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${!status ? "bg-indigo-600 text-white border-indigo-600" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}>
          All ({meta.total ?? 0})
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all capitalize ${
              status === s
                ? (STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600") + " border-current"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
            }`}>
            {s}{statusCounts[s] != null ? ` (${statusCounts[s]})` : ""}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
        <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search name, mobile, vehicle…"
          className="text-sm outline-none flex-1 placeholder:text-gray-400 bg-transparent" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No leads found</div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => (
            <div key={lead.id} onClick={() => setDrawer(lead)}
              className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                    {lead.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                    <div className="flex items-center flex-wrap gap-3 mt-1">
                      <a href={`tel:${lead.mobile}`} onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <Phone className="w-3 h-3" />{lead.mobile}
                      </a>
                      {lead.city && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />{lead.city}
                        </span>
                      )}
                      {lead.vehicleName && (
                        <span className="text-xs text-gray-500 font-medium">{lead.vehicleName}</span>
                      )}
                    </div>
                    {lead.notes && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{lead.notes}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {lead.status}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                  </span>
                  <span className="text-[10px] text-indigo-400 flex items-center gap-0.5">
                    <CalendarClock className="w-3 h-3" />Follow-up
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(meta.pages ?? 0) > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!meta.hasPrev}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-600 font-semibold">Page {meta.page} / {meta.pages}</span>
          <button onClick={() => setPage(p => Math.min(meta.pages, p + 1))} disabled={!meta.hasNext}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {drawer && <LeadDrawer lead={drawer} onClose={() => setDrawer(null)} onSaved={() => { setDrawer(null); load(); }} />}
    </div>
  );
}
