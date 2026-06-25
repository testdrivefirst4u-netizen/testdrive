"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  Plus, Pencil, Trash2, X, Save, Loader2, List,
  CheckCircle, XCircle, Car, Bike, Zap, Truck,
} from "lucide-react";

const VEHICLE_TYPES = ["CAR", "BIKE", "SCOOTER", "EV", "COMMERCIAL"] as const;
type VType = (typeof VEHICLE_TYPES)[number];

const TYPE_META: Record<VType, { label: string; color: string; Icon: any }> = {
  CAR:        { label: "Car",        color: "bg-blue-100 text-blue-700",    Icon: Car   },
  BIKE:       { label: "Bike",       color: "bg-orange-100 text-orange-700",Icon: Bike  },
  SCOOTER:    { label: "Scooter",    color: "bg-pink-100 text-pink-700",    Icon: Bike  },
  EV:         { label: "EV",         color: "bg-emerald-100 text-emerald-700", Icon: Zap },
  COMMERCIAL: { label: "Commercial", color: "bg-slate-100 text-slate-700",  Icon: Truck },
};

type Category = {
  id: string; name: string; slug: string; type: VType;
  description?: string | null; icon?: string | null; image?: string | null;
  isActive: boolean; sortOrder: number;
  _count?: { vehicles: number };
};

const EMPTY: Partial<Category> = { name: "", type: "CAR", description: "", icon: "", isActive: true, sortOrder: 0 };

export default function CategoriesPage() {
  const [items, setItems]       = useState<Category[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filterType, setFilter] = useState<VType | "">("");
  const [panel, setPanel]       = useState<"add" | Category | null>(null);
  const [form, setForm]         = useState<Partial<Category>>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/categories");
    const d = await r.json();
    setItems(d);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm(EMPTY); setPanel("add"); setError(null); }
  function openEdit(c: Category) { setForm({ ...c }); setPanel(c); setError(null); }

  async function save() {
    setSaving(true); setError(null);
    try {
      const isEdit = panel !== "add";
      const url    = isEdit ? `/api/admin/categories/${(panel as Category).id}` : "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";
      const res    = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      await load();
      setPanel(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this category?")) return;
    setDeleting(id);
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    await load();
    setDeleting(null);
  }

  async function toggleActive(c: Category) {
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, isActive: !c.isActive }),
    });
    setItems(prev => prev.map(x => x.id === c.id ? { ...x, isActive: !x.isActive } : x));
  }

  const filtered = filterType ? items.filter(c => c.type === filterType) : items;
  const counts   = VEHICLE_TYPES.reduce((acc, t) => ({ ...acc, [t]: items.filter(c => c.type === t).length }), {} as Record<VType, number>);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} total · {items.filter(c => c.isActive).length} active</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            filterType === "" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
          }`}>
          All ({items.length})
        </button>
        {VEHICLE_TYPES.map(t => {
          const m = TYPE_META[t];
          return (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterType === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}>
              {m.label} ({counts[t] || 0})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Loading categories…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <List className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No categories yet</p>
            <button onClick={openAdd} className="mt-3 text-xs text-blue-600 hover:underline">Add the first category</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/60">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Vehicles</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Order</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => {
                  const m = TYPE_META[c.type];
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg shrink-0">
                            {c.icon || <List className="w-4 h-4 text-gray-400" />}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{c.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">/{c.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.color}`}>{m.label}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                        <span className="text-sm font-semibold text-gray-700">{c._count?.vehicles ?? 0}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button onClick={() => toggleActive(c)}
                          className={`w-10 h-5 rounded-full transition-all relative ${c.isActive ? "bg-emerald-500" : "bg-gray-200"}`}>
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${c.isActive ? "left-5" : "left-0.5"}`} />
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center hidden md:table-cell">
                        <span className="text-xs text-gray-400">{c.sortOrder}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => openEdit(c)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => del(c.id)} disabled={deleting === c.id}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40">
                            {deleting === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide panel */}
      {panel !== null && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && setPanel(null)} />
          <div className="relative z-10 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50/80">
              <h2 className="text-sm font-bold text-gray-900">{panel === "add" ? "Add Category" : `Edit: ${(panel as Category).name}`}</h2>
              <button onClick={() => !saving && setPanel(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {error && <div className="bg-red-50 border-b border-red-100 px-5 py-2.5 text-xs text-red-600 font-medium">{error}</div>}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <F label="Name *">
                <input value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="inp" placeholder="e.g. Sedans" />
              </F>
              <F label="Vehicle Type *">
                <select value={form.type || "CAR"} onChange={e => setForm(p => ({ ...p, type: e.target.value as VType }))} className="inp">
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{TYPE_META[t].label}</option>)}
                </select>
              </F>
              <F label="Description">
                <textarea value={form.description || ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} className="inp resize-none" placeholder="Optional description" />
              </F>
              <F label="Icon (emoji or text)">
                <input value={form.icon || ""} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                  className="inp" placeholder="🚗" />
              </F>
              <F label="Sort Order">
                <input type="number" value={form.sortOrder ?? 0} onChange={e => setForm(p => ({ ...p, sortOrder: +e.target.value }))}
                  className="inp" min={0} />
              </F>
              <div className="flex items-center gap-3">
                <button onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                  className={`w-10 h-5 rounded-full transition-all relative ${form.isActive ? "bg-emerald-500" : "bg-gray-200"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? "left-5" : "left-0.5"}`} />
                </button>
                <span className="text-xs font-semibold text-gray-600">Active</span>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 bg-slate-50/80 flex gap-3">
              <button onClick={save} disabled={saving || !form.name}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl py-2.5 transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save Category"}
              </button>
              <button onClick={() => !saving && setPanel(null)}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                Cancel
              </button>
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
