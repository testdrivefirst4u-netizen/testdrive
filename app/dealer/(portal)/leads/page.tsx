"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Phone, MapPin, ChevronLeft, ChevronRight, Loader2, X, Save, MessageSquare } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-amber-100 text-amber-700",
  contacted: "bg-blue-100 text-blue-700",
  converted: "bg-emerald-100 text-emerald-700",
  lost:      "bg-red-100 text-red-600",
};

const STATUSES = ["new", "contacted", "converted", "lost"];

function LeadDrawer({ lead, onClose, onSaved }: { lead: any; onClose: () => void; onSaved: () => void }) {
  const [status, setStatus] = useState(lead.status as string);
  const [notes,  setNotes]  = useState((lead.notes as string) ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/dealer/leads/${lead.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="font-bold text-gray-900">{lead.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{lead.mobile}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-5 overflow-y-auto">
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
        </div>

        <div className="px-5 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={save} disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Update
          </button>
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
