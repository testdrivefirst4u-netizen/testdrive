"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import {
  Plus, Pencil, Trash2, X, Save, Loader2, HelpCircle,
  Search, ChevronDown, Car,
} from "lucide-react";

type Vehicle = { id: string; name: string; brand: { name: string } };

type Faq = {
  id: string; question: string; answer: string;
  category?: string | null; vehicleId?: string | null;
  sortOrder: number; isActive: boolean;
  vehicle?: { name: string; brand: { name: string } } | null;
};

const EMPTY: Partial<Faq> = { question: "", answer: "", category: "", vehicleId: null, sortOrder: 0, isActive: true };

type FilterTab = "all" | "general" | "vehicle";

export default function FaqsPage() {
  const [faqs, setFaqs]           = useState<Faq[]>([]);
  const [vehicles, setVehicles]   = useState<Vehicle[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [tabFilter, setTabFilter] = useState<FilterTab>("all");

  const [panel, setPanel]         = useState<"add" | Faq | null>(null);
  const [form, setForm]           = useState<Partial<Faq>>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);

  // Vehicle dropdown in form
  const [vehicleQ, setVehicleQ]   = useState("");
  const [showVDrop, setShowVDrop] = useState(false);

  async function load() {
    setLoading(true);
    const [faqsRes, vehiclesRes] = await Promise.all([
      fetch("/api/admin/faqs").then(r => r.json()),
      fetch("/api/admin/vehicles?limit=200").then(r => r.json()),
    ]);
    setFaqs(faqsRes);
    setVehicles(vehiclesRes.vehicles || vehiclesRes);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = faqs;
    if (tabFilter === "general") list = list.filter(f => !f.vehicleId);
    if (tabFilter === "vehicle") list = list.filter(f => !!f.vehicleId);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    }
    return list;
  }, [faqs, tabFilter, search]);

  const vehicleFiltered = useMemo(() =>
    vehicleQ
      ? vehicles.filter(v => `${v.brand.name} ${v.name}`.toLowerCase().includes(vehicleQ.toLowerCase()))
      : vehicles,
  [vehicles, vehicleQ]);

  const counts = {
    all:     faqs.length,
    general: faqs.filter(f => !f.vehicleId).length,
    vehicle: faqs.filter(f => !!f.vehicleId).length,
  };

  function openAdd() { setForm(EMPTY); setPanel("add"); setError(null); setVehicleQ(""); }
  function openEdit(f: Faq) { setForm({ ...f }); setPanel(f); setError(null); setVehicleQ(""); }

  async function save() {
    setSaving(true); setError(null);
    try {
      const isEdit = panel !== "add";
      const url    = isEdit ? `/api/admin/faqs/${(panel as Faq).id}` : "/api/admin/faqs";
      const res    = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      await load();
      setPanel(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    setDeleting(id);
    await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    setFaqs(p => p.filter(f => f.id !== id));
    setDeleting(null);
  }

  async function toggleActive(faq: Faq) {
    await fetch(`/api/admin/faqs/${faq.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !faq.isActive }),
    });
    setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, isActive: !f.isActive } : f));
  }

  const selectedVehicle = form.vehicleId ? vehicles.find(v => v.id === form.vehicleId) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">FAQs</h1>
          <p className="text-gray-500 text-sm mt-0.5">{faqs.length} total · {counts.general} general · {counts.vehicle} vehicle-specific</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors">
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-wrap items-center gap-3">
        {(["all", "general", "vehicle"] as FilterTab[]).map(t => (
          <button key={t} onClick={() => setTabFilter(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize ${
              tabFilter === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}>
            {t === "vehicle" ? "Vehicle-Specific" : t.charAt(0).toUpperCase() + t.slice(1)} ({counts[t]})
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search FAQs…"
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm w-48 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center"><Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" /><p className="text-sm text-gray-400">Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <HelpCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No FAQs found</p>
            <button onClick={openAdd} className="mt-3 text-xs text-blue-600 hover:underline font-semibold">Add the first FAQ</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(f => (
              <div key={f.id} className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {f.vehicle && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          <Car className="w-2.5 h-2.5" /> {f.vehicle.brand.name} {f.vehicle.name}
                        </span>
                      )}
                      {!f.vehicle && <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">General</span>}
                      {f.category && <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{f.category}</span>}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{f.question}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{f.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleActive(f)}
                      className={`w-9 h-4.5 rounded-full transition-all relative shrink-0 ${f.isActive ? "bg-emerald-500" : "bg-gray-200"}`}
                      style={{ minWidth: "2.25rem", height: "1.1rem" }}>
                      <span className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-all ${f.isActive ? "left-4" : "left-0.5"}`} />
                    </button>
                    <button onClick={() => openEdit(f)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => del(f.id)} disabled={deleting === f.id}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      {deleting === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide panel */}
      {panel !== null && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && setPanel(null)} />
          <div className="relative z-10 w-full max-w-lg bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50/80">
              <h2 className="text-sm font-bold text-gray-900">{panel === "add" ? "Add FAQ" : "Edit FAQ"}</h2>
              <button onClick={() => !saving && setPanel(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {error && <div className="bg-red-50 border-b border-red-100 px-5 py-2.5 text-xs text-red-600">{error}</div>}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <F label="Question *">
                <textarea value={form.question || ""} onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                  rows={3} className="inp resize-none" placeholder="What is the mileage of…?" />
              </F>
              <F label="Answer *">
                <textarea value={form.answer || ""} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
                  rows={5} className="inp resize-none" placeholder="The mileage is approximately…" />
              </F>
              <F label="Category (optional)">
                <input value={form.category || ""} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="inp" placeholder="e.g. Performance, Safety, Features" />
              </F>

              {/* Vehicle link */}
              <F label="Link to Vehicle (optional — leave blank for general FAQ)">
                <div className="relative">
                  <div onClick={() => setShowVDrop(p => !p)}
                    className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer hover:border-blue-300 transition-colors">
                    <Car className="w-4 h-4 text-gray-400 shrink-0" />
                    {selectedVehicle
                      ? <span className="flex-1 text-sm font-semibold text-gray-800">{selectedVehicle.brand.name} {selectedVehicle.name}</span>
                      : <span className="flex-1 text-sm text-gray-400">General FAQ (no vehicle)</span>}
                    {form.vehicleId && (
                      <button onClick={e => { e.stopPropagation(); setForm(p => ({ ...p, vehicleId: null })); }}
                        className="text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showVDrop ? "rotate-180" : ""}`} />
                  </div>
                  {showVDrop && (
                    <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <input value={vehicleQ} onChange={e => setVehicleQ(e.target.value)} autoFocus
                          placeholder="Search vehicles…"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        <button onClick={() => { setForm(p => ({ ...p, vehicleId: null })); setShowVDrop(false); }}
                          className="w-full flex items-center px-4 py-2.5 text-left hover:bg-gray-50 transition-colors">
                          <span className="text-sm text-gray-500">— General FAQ</span>
                        </button>
                        {vehicleFiltered.slice(0, 30).map(v => (
                          <button key={v.id} onClick={() => { setForm(p => ({ ...p, vehicleId: v.id })); setShowVDrop(false); setVehicleQ(""); }}
                            className={`w-full flex items-center px-4 py-2.5 text-left hover:bg-blue-50 transition-colors ${form.vehicleId === v.id ? "bg-blue-50" : ""}`}>
                            <p className="text-sm font-semibold text-gray-800">{v.brand.name} {v.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </F>

              <div className="grid grid-cols-2 gap-3">
                <F label="Sort Order">
                  <input type="number" value={form.sortOrder ?? 0} onChange={e => setForm(p => ({ ...p, sortOrder: +e.target.value }))} className="inp" min={0} />
                </F>
                <F label="Active">
                  <div className="flex items-center gap-3 pt-1">
                    <button onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                      className={`w-10 h-5 rounded-full transition-all relative ${form.isActive ? "bg-emerald-500" : "bg-gray-200"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? "left-5" : "left-0.5"}`} />
                    </button>
                    <span className="text-xs text-gray-600 font-medium">{form.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </F>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 bg-slate-50/80 flex gap-3">
              <button onClick={save} disabled={saving || !form.question || !form.answer}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl py-2.5 transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save FAQ"}
              </button>
              <button onClick={() => !saving && setPanel(null)}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <style>{`.inp{width:100%;border:1px solid #e5e7eb;border-radius:0.75rem;padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.inp:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}`}</style>
    </div>
  );
}

function F({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-700 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
