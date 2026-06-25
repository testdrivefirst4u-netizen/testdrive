"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import {
  Plus, Pencil, Trash2, X, Save, Loader2, Settings2, Search, ChevronDown,
} from "lucide-react";

type Vehicle = { id: string; name: string; slug: string; brand: { name: string } };

type Variant = {
  id: string; vehicleId: string; name: string; slug: string;
  priceMin?: number | null; priceMax?: number | null; priceDisplay?: string | null;
  fuelType?: string | null; transmission?: string | null; engine?: string | null;
  power?: string | null; torque?: string | null; mileage?: string | null;
  range?: string | null; isDefault: boolean;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED"; sortOrder: number;
};

const EMPTY: Partial<Variant> = {
  name: "", priceDisplay: "", fuelType: "Petrol", transmission: "Manual",
  engine: "", power: "", torque: "", mileage: "", range: "",
  isDefault: false, status: "PUBLISHED", sortOrder: 0,
};

const FUEL_TYPES    = ["Petrol", "Diesel", "CNG", "LPG", "Electric", "Hybrid", "Petrol+CNG"];
const TRANSMISSIONS = ["Manual", "Automatic", "AMT", "CVT", "DCT", "IMT"];

function fmt(price?: number | null) {
  if (!price) return "";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000)   return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString()}`;
}

export default function VariantsPage() {
  const [vehicles, setVehicles]     = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId]   = useState("");
  const [vehicleQ, setVehicleQ]     = useState("");
  const [showDrop, setShowDrop]     = useState(false);
  const [variants, setVariants]     = useState<Variant[]>([]);
  const [loadingV, setLoadingV]     = useState(false);
  const [panel, setPanel]           = useState<"add" | Variant | null>(null);
  const [form, setForm]             = useState<Partial<Variant>>(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/vehicles?limit=200")
      .then(r => r.json())
      .then(d => setVehicles(d.vehicles || d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!vehicleId) { setVariants([]); return; }
    setLoadingV(true);
    fetch(`/api/admin/vehicles/${vehicleId}/variants`)
      .then(r => r.json())
      .then(d => setVariants(Array.isArray(d) ? d : []))
      .catch(() => setVariants([]))
      .finally(() => setLoadingV(false));
  }, [vehicleId]);

  const filtered = useMemo(() =>
    vehicleQ
      ? vehicles.filter(v => `${v.brand.name} ${v.name}`.toLowerCase().includes(vehicleQ.toLowerCase()))
      : vehicles,
  [vehicles, vehicleQ]);

  const selectedV = vehicles.find(v => v.id === vehicleId);

  async function save() {
    if (!vehicleId) return;
    setSaving(true); setError(null);
    try {
      const isEdit = panel !== "add";
      const url    = isEdit
        ? `/api/admin/vehicles/${vehicleId}/variants/${(panel as Variant).id}`
        : `/api/admin/vehicles/${vehicleId}/variants`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const updated = await fetch(`/api/admin/vehicles/${vehicleId}/variants`).then(r => r.json());
      setVariants(updated);
      setPanel(null);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this variant?")) return;
    setDeleting(id);
    await fetch(`/api/admin/vehicles/${vehicleId}/variants/${id}`, { method: "DELETE" });
    setVariants(p => p.filter(v => v.id !== id));
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Variants</h1>
          <p className="text-gray-500 text-sm mt-0.5">Select a vehicle to manage its variants</p>
        </div>
        {vehicleId && (
          <button onClick={() => { setForm(EMPTY); setPanel("add"); setError(null); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors">
            <Plus className="w-4 h-4" /> Add Variant
          </button>
        )}
      </div>

      {/* Vehicle selector */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Select Vehicle</label>
        <div className="relative">
          <div onClick={() => setShowDrop(p => !p)}
            className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 cursor-pointer hover:border-blue-300 transition-colors">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            {selectedV
              ? <span className="flex-1 text-sm font-semibold text-gray-800">{selectedV.brand.name} {selectedV.name}</span>
              : <span className="flex-1 text-sm text-gray-400">Search vehicle…</span>}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDrop ? "rotate-180" : ""}`} />
          </div>
          {showDrop && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <input value={vehicleQ} onChange={e => setVehicleQ(e.target.value)} autoFocus
                  placeholder="Type to search…"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400" />
              </div>
              <div className="max-h-56 overflow-y-auto">
                {filtered.slice(0, 50).map(v => (
                  <button key={v.id} onClick={() => { setVehicleId(v.id); setShowDrop(false); setVehicleQ(""); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-blue-50 transition-colors ${vehicleId === v.id ? "bg-blue-50" : ""}`}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{v.brand.name} {v.name}</p>
                      <p className="text-[10px] text-gray-400">/{v.slug}</p>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && <p className="text-center py-4 text-sm text-gray-400">No vehicles found</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Variants table */}
      {vehicleId && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {loadingV ? (
            <div className="py-12 text-center">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-400">Loading variants…</p>
            </div>
          ) : variants.length === 0 ? (
            <div className="py-12 text-center">
              <Settings2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No variants for this vehicle</p>
              <button onClick={() => { setForm(EMPTY); setPanel("add"); }}
                className="mt-3 text-xs text-blue-600 hover:underline font-semibold">Add first variant</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50/60">
                    <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Variant</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Price</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Fuel / Trans</th>
                    <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Power / Mileage</th>
                    <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {variants.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800 text-xs">{v.name}</p>
                          {v.isDefault && <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Default</span>}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">/{v.slug}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <p className="text-xs font-semibold text-gray-700">
                          {v.priceDisplay || (v.priceMin ? `${fmt(v.priceMin)}${v.priceMax ? ` – ${fmt(v.priceMax)}` : ""}` : "—")}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-xs text-gray-600">{[v.fuelType, v.transmission].filter(Boolean).join(" · ") || "—"}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <p className="text-xs text-gray-600">{[v.power, v.mileage || v.range].filter(Boolean).join(" · ") || "—"}</p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          v.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
                          v.status === "DRAFT"     ? "bg-gray-100 text-gray-600" :
                                                     "bg-red-100 text-red-600"}`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => { setForm({ ...v }); setPanel(v); setError(null); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => del(v.id)} disabled={deleting === v.id}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            {deleting === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Slide panel */}
      {panel !== null && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && setPanel(null)} />
          <div className="relative z-10 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50/80">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{selectedV?.brand.name} {selectedV?.name}</p>
                <h2 className="text-sm font-bold text-gray-900">{panel === "add" ? "Add Variant" : `Edit: ${(panel as Variant).name}`}</h2>
              </div>
              <button onClick={() => !saving && setPanel(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {error && <div className="bg-red-50 border-b border-red-100 px-5 py-2.5 text-xs text-red-600">{error}</div>}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <F label="Variant Name *">
                <input value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="inp" placeholder="e.g. VXi, ZXi+, Grande" />
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Price Min">
                  <input type="number" value={form.priceMin || ""} onChange={e => setForm(p => ({ ...p, priceMin: +e.target.value || null }))} className="inp" placeholder="500000" />
                </F>
                <F label="Price Max">
                  <input type="number" value={form.priceMax || ""} onChange={e => setForm(p => ({ ...p, priceMax: +e.target.value || null }))} className="inp" placeholder="800000" />
                </F>
              </div>
              <F label="Price Display">
                <input value={form.priceDisplay || ""} onChange={e => setForm(p => ({ ...p, priceDisplay: e.target.value }))} className="inp" placeholder="₹5.00 – ₹8.00 Lakh" />
              </F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Fuel Type">
                  <select value={form.fuelType || ""} onChange={e => setForm(p => ({ ...p, fuelType: e.target.value }))} className="inp">
                    <option value="">—</option>
                    {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </F>
                <F label="Transmission">
                  <select value={form.transmission || ""} onChange={e => setForm(p => ({ ...p, transmission: e.target.value }))} className="inp">
                    <option value="">—</option>
                    {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label="Engine"><input value={form.engine || ""} onChange={e => setForm(p => ({ ...p, engine: e.target.value }))} className="inp" placeholder="1197 cc" /></F>
                <F label="Power"><input value={form.power || ""} onChange={e => setForm(p => ({ ...p, power: e.target.value }))} className="inp" placeholder="88 bhp" /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label="Mileage"><input value={form.mileage || ""} onChange={e => setForm(p => ({ ...p, mileage: e.target.value }))} className="inp" placeholder="21.5 kmpl" /></F>
                <F label="Range (EV)"><input value={form.range || ""} onChange={e => setForm(p => ({ ...p, range: e.target.value }))} className="inp" placeholder="400 km" /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label="Status">
                  <select value={form.status || "PUBLISHED"} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))} className="inp">
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </F>
                <F label="Sort Order">
                  <input type="number" value={form.sortOrder ?? 0} onChange={e => setForm(p => ({ ...p, sortOrder: +e.target.value }))} className="inp" min={0} />
                </F>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setForm(p => ({ ...p, isDefault: !p.isDefault }))}
                  className={`w-10 h-5 rounded-full transition-all relative ${form.isDefault ? "bg-emerald-500" : "bg-gray-200"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isDefault ? "left-5" : "left-0.5"}`} />
                </button>
                <span className="text-xs font-semibold text-gray-600">Default variant</span>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 bg-slate-50/80 flex gap-3">
              <button onClick={save} disabled={saving || !form.name}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl py-2.5 transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save Variant"}
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
