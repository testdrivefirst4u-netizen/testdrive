"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Building2, Phone, Mail, MapPin, Loader2, X, Save, Search, Trash2 } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:      "bg-green-100 text-green-700",
  INACTIVE:    "bg-gray-100 text-gray-500",
  VACATION:    "bg-yellow-100 text-yellow-700",
  MAINTENANCE: "bg-orange-100 text-orange-600",
  CLOSED:      "bg-red-100 text-red-700",
};

interface Brand { id: string; name: string; logo?: string }

function DealerModal({ brands, onClose, onSaved }: { brands: Brand[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name:"", code:"", brandId:"", email:"", phone:"", city:"", state:"",
    pincodes:"", address:"", managerName:"", priority:"1", weight:"1", maxLeadsPerDay:"50",
    adminName:"", adminEmail:"", adminPassword:"",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function save() {
    if (!form.name || !form.code || !form.brandId || !form.email || !form.city || !form.state) {
      setError("Name, code, brand, email, city and state are required"); return;
    }
    setSaving(true); setError("");
    const payload = {
      ...form,
      pincodes: form.pincodes.split(",").map(s => s.trim()).filter(Boolean),
      priority: Number(form.priority),
      weight:   Number(form.weight),
      maxLeadsPerDay: Number(form.maxLeadsPerDay),
    };
    const res = await fetch("/api/crm/dealers", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { setError((await res.json()).error ?? "Failed to save"); return; }
    onSaved();
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">Add Dealer</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dealer Info</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1">Dealer Name *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Dealer Code *</label>
              <input value={form.code} onChange={e => set("code", e.target.value)} className={inputCls} placeholder="e.g. HYD001" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Brand *</label>
              <select value={form.brandId} onChange={e => set("brandId", e.target.value)} className={inputCls + " bg-white"}>
                <option value="">Select brand…</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Phone</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">City *</label>
              <input value={form.city} onChange={e => set("city", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">State *</label>
              <input value={form.state} onChange={e => set("state", e.target.value)} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1">Address</label>
              <input value={form.address} onChange={e => set("address", e.target.value)} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1">Pincodes (comma separated)</label>
              <input value={form.pincodes} onChange={e => set("pincodes", e.target.value)} className={inputCls} placeholder="500001, 500032, 500033" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Manager Name</label>
              <input value={form.managerName} onChange={e => set("managerName", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Max Leads/Day</label>
              <input type="number" value={form.maxLeadsPerDay} onChange={e => set("maxLeadsPerDay", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Priority (1–10)</label>
              <input type="number" min="1" max="10" value={form.priority} onChange={e => set("priority", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Weight (1–10)</label>
              <input type="number" min="1" max="10" value={form.weight} onChange={e => set("weight", e.target.value)} className={inputCls} />
            </div>
          </div>

          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider pt-2">Admin Account (optional)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Admin Name</label>
              <input value={form.adminName} onChange={e => set("adminName", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Admin Email</label>
              <input type="email" value={form.adminEmail} onChange={e => set("adminEmail", e.target.value)} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1">Password</label>
              <input type="password" value={form.adminPassword} onChange={e => set("adminPassword", e.target.value)} className={inputCls} />
            </div>
          </div>

          {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
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

export default function CrmDealersPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [brands,  setBrands]  = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [search,  setSearch]  = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [dr, br] = await Promise.all([
      fetch("/api/crm/dealers?limit=200").then(r => r.json()),
      fetch("/api/admin/brands?limit=200").then(r => r.json()),
    ]);
    setDealers(dr.dealers ?? []);
    // /api/admin/brands returns { brands: [...] }
    setBrands(Array.isArray(br) ? br : (br.brands ?? []));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = search
    ? dealers.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.city.toLowerCase().includes(search.toLowerCase())
      )
    : dealers;

  async function deleteDealer(id: string) {
    if (!confirm("Delete this dealer?")) return;
    await fetch(`/api/crm/dealers/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dealers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dealers.length} dealers registered</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl">
          <Plus className="w-4 h-4" /> Add Dealer
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 max-w-sm">
        <Search className="w-3.5 h-3.5 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dealer or city…"
          className="text-sm outline-none flex-1 placeholder:text-gray-400 bg-transparent" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No dealers found</p>
          <button onClick={() => setModal(true)} className="mt-3 text-blue-600 text-sm font-semibold hover:underline">
            Add your first dealer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(d => (
            <div key={d.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{d.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.code} · {d.brand?.name}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[d.status] ?? "bg-gray-100 text-gray-500"}`}>
                    {d.status}
                  </span>
                  <button onClick={() => deleteDealer(d.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-gray-400" />{d.city}, {d.state}</div>
                <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-gray-400" />{d.email}</div>
                {d.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400" />{d.phone}</div>}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-gray-400">
                <span>Max {d.maxLeadsPerDay} leads/day</span>
                <span>P{d.priority} · W{d.weight}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <DealerModal brands={brands} onClose={() => setModal(false)} onSaved={() => { setModal(false); load(); }} />
      )}
    </div>
  );
}
