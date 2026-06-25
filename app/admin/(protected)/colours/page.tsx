"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { Plus, Trash2, X, Save, Loader2, Search, ChevronDown, Palette } from "lucide-react";

type Vehicle = { id: string; name: string; slug: string; brand: { name: string } };

type Colour = {
  id: string; vehicleId: string; name: string;
  hexCode?: string | null; imageUrl?: string | null; sortOrder: number;
};

const EMPTY: Partial<Colour> = { name: "", hexCode: "#3B82F6", imageUrl: "", sortOrder: 0 };

const PRESETS = [
  "#FFFFFF","#F5F5F0","#C0C0C0","#808080","#1C1C1C","#000000",
  "#B22222","#DC143C","#FF6B6B","#FF8C00","#FFD700","#F5F5DC",
  "#228B22","#2E8B57","#006400","#1E90FF","#4169E1","#000080",
  "#800080","#8B4513","#A0522D","#DEB887","#F4A460","#CD853F",
];

export default function ColoursPage() {
  const [vehicles, setVehicles]     = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId]   = useState("");
  const [vehicleQ, setVehicleQ]     = useState("");
  const [showDrop, setShowDrop]     = useState(false);
  const [colours, setColours]       = useState<Colour[]>([]);
  const [loadingC, setLoadingC]     = useState(false);
  const [showAdd, setShowAdd]       = useState(false);
  const [form, setForm]             = useState<Partial<Colour>>(EMPTY);
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
    if (!vehicleId) { setColours([]); return; }
    setLoadingC(true);
    fetch(`/api/admin/vehicles/${vehicleId}/colours`)
      .then(r => r.json())
      .then(d => setColours(Array.isArray(d) ? d : []))
      .catch(() => setColours([]))
      .finally(() => setLoadingC(false));
  }, [vehicleId]);

  const filtered = useMemo(() =>
    vehicleQ ? vehicles.filter(v => `${v.brand.name} ${v.name}`.toLowerCase().includes(vehicleQ.toLowerCase())) : vehicles,
  [vehicles, vehicleQ]);

  const selectedV = vehicles.find(v => v.id === vehicleId);

  async function save() {
    if (!vehicleId || !form.name) return;
    setSaving(true); setError(null);
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}/colours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const updated = await fetch(`/api/admin/vehicles/${vehicleId}/colours`).then(r => r.json());
      setColours(updated);
      setShowAdd(false);
      setForm(EMPTY);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function del(colourId: string) {
    if (!confirm("Remove this colour?")) return;
    setDeleting(colourId);
    await fetch(`/api/admin/vehicles/${vehicleId}/colours?colourId=${colourId}`, { method: "DELETE" });
    setColours(p => p.filter(c => c.id !== colourId));
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Vehicle Colours</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage colour options per vehicle</p>
        </div>
        {vehicleId && (
          <button onClick={() => { setForm(EMPTY); setShowAdd(true); setError(null); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors">
            <Plus className="w-4 h-4" /> Add Colour
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
                    <p className="text-sm font-semibold text-gray-800">{v.brand.name} {v.name}</p>
                  </button>
                ))}
                {filtered.length === 0 && <p className="text-center py-4 text-sm text-gray-400">No vehicles found</p>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Colour grid */}
      {vehicleId && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          {loadingC ? (
            <div className="py-10 text-center">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-400">Loading colours…</p>
            </div>
          ) : (
            <>
              {colours.length === 0 && !showAdd && (
                <div className="py-8 text-center">
                  <Palette className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No colours added yet</p>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {colours.map(c => (
                  <div key={c.id} className="relative group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Colour swatch */}
                    <div className="h-16 w-full flex items-center justify-center" style={{ backgroundColor: c.hexCode || "#E5E7EB" }}>
                      {c.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    {/* Label */}
                    <div className="p-2.5 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{c.name}</p>
                        {c.hexCode && <p className="text-[10px] text-gray-400 font-mono">{c.hexCode}</p>}
                      </div>
                      <button onClick={() => del(c.id)} disabled={deleting === c.id}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                        {deleting === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add colour inline */}
                {!showAdd && (
                  <button onClick={() => { setForm(EMPTY); setShowAdd(true); setError(null); }}
                    className="h-28 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-blue-500">
                    <Plus className="w-5 h-5" />
                    <span className="text-xs font-semibold">Add Colour</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Add colour slide panel */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && setShowAdd(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50/80">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{selectedV?.brand.name} {selectedV?.name}</p>
                <h2 className="text-sm font-bold text-gray-900">Add Colour</h2>
              </div>
              <button onClick={() => !saving && setShowAdd(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {error && <div className="bg-red-50 border-b border-red-100 px-5 py-2.5 text-xs text-red-600">{error}</div>}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <F label="Colour Name *">
                <input value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="inp" placeholder="e.g. Midnight Black, Pearl White" />
              </F>

              {/* Colour picker */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Hex Colour</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.hexCode || "#3B82F6"} onChange={e => setForm(p => ({ ...p, hexCode: e.target.value }))}
                    className="w-12 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5" />
                  <input value={form.hexCode || ""} onChange={e => setForm(p => ({ ...p, hexCode: e.target.value }))}
                    className="flex-1 inp font-mono" placeholder="#3B82F6" />
                </div>
                {/* Presets */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESETS.map(hex => (
                    <button key={hex} onClick={() => setForm(p => ({ ...p, hexCode: hex }))}
                      title={hex}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${form.hexCode === hex ? "border-blue-500 scale-110" : "border-transparent hover:border-gray-300"}`}
                      style={{ backgroundColor: hex }} />
                  ))}
                </div>
              </div>

              <F label="Image URL (optional)">
                <input value={form.imageUrl || ""} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
                  className="inp" placeholder="https://ik.imagekit.io/…" />
                {form.imageUrl && (
                  <div className="mt-2 h-16 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                )}
              </F>

              {/* Live preview */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <div className="h-20" style={{ backgroundColor: form.hexCode || "#E5E7EB" }} />
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-700">{form.name || "Colour name"}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{form.hexCode || "#000000"}</p>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 bg-slate-50/80 flex gap-3">
              <button onClick={save} disabled={saving || !form.name}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl py-2.5 transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Add Colour"}
              </button>
              <button onClick={() => !saving && setShowAdd(false)}
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
