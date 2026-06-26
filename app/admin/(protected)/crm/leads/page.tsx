"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Phone, MapPin, ChevronLeft, ChevronRight, Loader2, RefreshCw, Plus, X, Save } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700", assigned: "bg-indigo-100 text-indigo-700",
  contacted: "bg-yellow-100 text-yellow-700", interested: "bg-orange-100 text-orange-700",
  follow_up: "bg-purple-100 text-purple-700", booked: "bg-green-100 text-green-700",
  delivered: "bg-emerald-100 text-emerald-700", lost: "bg-red-100 text-red-700",
};

const SOURCES = ["website","facebook","google_ads","instagram","whatsapp","walk_in","phone_call","referral","other"];

function AddLeadModal({ brands, onClose, onSaved }: { brands: any[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    customerName:"", mobile:"", email:"", city:"", state:"", pincode:"",
    brandId:"", vehicle:"", source:"website", priority:"medium",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  async function save() {
    if (!form.customerName || !form.mobile || !form.brandId) {
      setError("Name, mobile and brand are required"); return;
    }
    setSaving(true); setError("");
    const res = await fetch("/api/crm/leads", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setError((await res.json()).error ?? "Failed to save"); return; }
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">Add CRM Lead</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {[
            { k:"customerName", l:"Name *",    span:true  },
            { k:"mobile",       l:"Mobile *"              },
            { k:"email",        l:"Email"                 },
            { k:"city",         l:"City"                  },
            { k:"state",        l:"State"                 },
            { k:"pincode",      l:"Pincode"               },
            { k:"vehicle",      l:"Vehicle"               },
          ].map(f => (
            <div key={f.k} className={(f as any).span ? "col-span-2" : ""}>
              <label className="text-xs font-semibold text-gray-500 block mb-1">{f.l}</label>
              <input value={(form as any)[f.k]} onChange={e => set(f.k, e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Brand *</label>
            <select value={form.brandId} onChange={e => set("brandId", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select brand…</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Source</label>
            <select value={form.source} onChange={e => set("source", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-gray-500 block mb-1">Priority</label>
            <select value={form.priority} onChange={e => set("priority", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              {["low","medium","high","urgent"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {error && <p className="col-span-2 text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">Cancel</button>
          <button onClick={save} disabled={saving}
            className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CrmLeadsPage() {
  const [leads,    setLeads]    = useState<any[]>([]);
  const [meta,     setMeta]     = useState<any>({});
  const [brands,   setBrands]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("");
  const [brandId,  setBrandId]  = useState("");
  const [page,     setPage]     = useState(1);

  const loadBrands = useCallback(async () => {
    if (brands.length > 0) return;
    const res = await fetch("/api/admin/brands?limit=200");
    const data = await res.json();
    // /api/admin/brands returns { brands: [...], total, pages }
    setBrands(Array.isArray(data) ? data : (data.brands ?? []));
  }, [brands.length]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams({
      page: String(page), limit: "20", search,
      ...(status   ? { status }   : {}),
      ...(brandId  ? { brandId }  : {}),
    });
    const res = await fetch(`/api/crm/leads?${p}`);
    const data = await res.json();
    setLeads(data.leads ?? []);
    setMeta(data.meta ?? {});
    setLoading(false);
  }, [page, search, status, brandId]);

  useEffect(() => { loadBrands(); }, [loadBrands]);
  useEffect(() => { loadLeads(); }, [loadLeads]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">CRM Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total ?? 0} total leads</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadLeads} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-200 text-gray-500">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, mobile, vehicle…"
            className="text-sm outline-none flex-1 placeholder:text-gray-400 bg-transparent" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option value="">All statuses</option>
          {["new","assigned","contacted","interested","follow_up","booked","delivered","lost"].map(s => (
            <option key={s} value={s}>{s.replace(/_/g," ")}</option>
          ))}
        </select>
        <select value={brandId} onChange={e => { setBrandId(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
          <option value="">All brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium">No leads found</p>
          <p className="text-sm mt-1">Add your first CRM lead or adjust the filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => (
            <div key={lead.id} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                    {lead.customerName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{lead.customerName}</p>
                    <div className="flex items-center flex-wrap gap-3 mt-1">
                      <a href={`tel:${lead.mobile}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <Phone className="w-3 h-3" />{lead.mobile}
                      </a>
                      {lead.city && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />{lead.city}
                        </span>
                      )}
                      {lead.vehicle && <span className="text-xs text-gray-500 font-medium">{lead.vehicle}</span>}
                      {lead.brand && <span className="text-xs text-gray-400">{lead.brand.name}</span>}
                    </div>
                    {lead.dealer && <p className="text-xs text-gray-400 mt-1">→ {lead.dealer.name}</p>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {lead.status?.replace(/_/g, " ")}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    lead.priority === "urgent" ? "bg-red-100 text-red-600"
                    : lead.priority === "high"   ? "bg-orange-100 text-orange-600"
                    : "bg-gray-100 text-gray-500"
                  }`}>
                    {lead.priority}
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

      {/* Pagination */}
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

      {modal && (
        <AddLeadModal brands={brands} onClose={() => setModal(false)} onSaved={() => { setModal(false); loadLeads(); }} />
      )}
    </div>
  );
}
