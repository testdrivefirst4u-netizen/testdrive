"use client";
import { useState, useEffect } from "react";
import { Save, Loader2, GitBranch, Plus, Trash2 } from "lucide-react";

const STRATEGIES = [
  { value: "round_robin", label: "Round Robin",  desc: "Equally distribute in rotation" },
  { value: "weighted",    label: "Weighted",      desc: "Proportional by dealer weight"  },
  { value: "priority",    label: "Priority",      desc: "Highest priority dealer first"  },
  { value: "random",      label: "Random",        desc: "Random available dealer"        },
  { value: "pincode",     label: "Pincode Based", desc: "Route by customer pincode"      },
  { value: "city",        label: "City Based",    desc: "Route by customer city"         },
  { value: "vehicle",     label: "Vehicle Based", desc: "Route by vehicle interest"      },
];

const inp = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function RuleEditor({ rule, dealers, onSave }: { rule: any; dealers: any[]; onSave: () => void }) {
  const [form,   setForm]   = useState<any>({ ...rule });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    await fetch("/api/crm/assignment-rules", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandId: rule.brandId, ...form }),
    });
    setSaving(false);
    onSave();
  }

  const dealersForBrand = dealers.filter(d => d.brandId === rule.brandId);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shrink-0">
            {rule.brand?.name?.[0] ?? "B"}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{rule.brand?.name}</h3>
            <p className="text-xs text-gray-400">{dealersForBrand.length} dealers</p>
          </div>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
        </button>
      </div>

      {/* Strategy */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Strategy</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {STRATEGIES.map(s => (
            <button key={s.value} onClick={() => set("strategy", s.value)}
              className={`text-left p-3 rounded-xl border-2 transition-all ${form.strategy === s.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
              <p className={`text-xs font-bold ${form.strategy === s.value ? "text-blue-700" : "text-gray-700"}`}>{s.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Auto-reassign */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Auto Reassignment</span>
          <button onClick={() => set("autoReassignEnabled", !form.autoReassignEnabled)}
            className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${form.autoReassignEnabled ? "bg-blue-600" : "bg-gray-300"}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.autoReassignEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        {form.autoReassignEnabled && (
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Reassign after (min)</label>
            <input type="number" min="5" value={form.reassignAfterMinutes ?? 30}
              onChange={e => set("reassignAfterMinutes", Number(e.target.value))} className={inp} />
          </div>
        )}
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">After Hours Action</label>
          <select value={form.afterHoursAction ?? "queue"} onChange={e => set("afterHoursAction", e.target.value)} className={inp + " bg-white"}>
            <option value="queue">Queue Lead</option>
            <option value="assign_24x7">Assign to 24x7 Dealer</option>
            <option value="skip">Skip</option>
          </select>
        </div>
      </div>

      {/* Pincode map */}
      {form.strategy === "pincode" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pincode → Dealer</p>
            <button onClick={() => set("pincodeMap", [...(form.pincodeMap ?? []), { pincode: "", dealer: "" }])}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {(form.pincodeMap ?? []).map((m: any, i: number) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input value={m.pincode}
                onChange={e => { const pm = [...(form.pincodeMap ?? [])]; pm[i] = { ...pm[i], pincode: e.target.value }; set("pincodeMap", pm); }}
                placeholder="500001" className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={m.dealer}
                onChange={e => { const pm = [...(form.pincodeMap ?? [])]; pm[i] = { ...pm[i], dealer: e.target.value }; set("pincodeMap", pm); }}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select dealer…</option>
                {dealersForBrand.map(d => <option key={d.id} value={d.id}>{d.name} — {d.city}</option>)}
              </select>
              <button onClick={() => set("pincodeMap", (form.pincodeMap ?? []).filter((_: any, j: number) => j !== i))}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* City map */}
      {form.strategy === "city" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">City → Dealer</p>
            <button onClick={() => set("cityMap", [...(form.cityMap ?? []), { city: "", dealer: "" }])}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {(form.cityMap ?? []).map((m: any, i: number) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input value={m.city}
                onChange={e => { const cm = [...(form.cityMap ?? [])]; cm[i] = { ...cm[i], city: e.target.value }; set("cityMap", cm); }}
                placeholder="Hyderabad" className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={m.dealer}
                onChange={e => { const cm = [...(form.cityMap ?? [])]; cm[i] = { ...cm[i], dealer: e.target.value }; set("cityMap", cm); }}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 bg-white">
                <option value="">Select dealer…</option>
                {dealersForBrand.map(d => <option key={d.id} value={d.id}>{d.name} — {d.city}</option>)}
              </select>
              <button onClick={() => set("cityMap", (form.cityMap ?? []).filter((_: any, j: number) => j !== i))}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle map */}
      {form.strategy === "vehicle" && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle → Dealer</p>
            <button onClick={() => set("vehicleMap", [...(form.vehicleMap ?? []), { vehicle: "", dealer: "" }])}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          {(form.vehicleMap ?? []).map((m: any, i: number) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input value={m.vehicle}
                onChange={e => { const vm = [...(form.vehicleMap ?? [])]; vm[i] = { ...vm[i], vehicle: e.target.value }; set("vehicleMap", vm); }}
                placeholder="Creta" className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={m.dealer}
                onChange={e => { const vm = [...(form.vehicleMap ?? [])]; vm[i] = { ...vm[i], dealer: e.target.value }; set("vehicleMap", vm); }}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 bg-white">
                <option value="">Select dealer…</option>
                {dealersForBrand.map(d => <option key={d.id} value={d.id}>{d.name} — {d.city}</option>)}
              </select>
              <button onClick={() => set("vehicleMap", (form.vehicleMap ?? []).filter((_: any, j: number) => j !== i))}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AssignmentRulesPage() {
  const [rules,   setRules]   = useState<any[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [r, d] = await Promise.all([
      fetch("/api/crm/assignment-rules").then(r => r.json()),
      fetch("/api/crm/dealers?limit=500").then(r => r.json()),
    ]);
    setRules(Array.isArray(r) ? r : []);
    setDealers(d.dealers ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Assignment Rules</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure how leads are routed to dealers per brand</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : rules.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No rules configured yet</p>
          <p className="text-sm mt-1">Add dealers first, then assignment rules will appear here</p>
        </div>
      ) : (
        rules.map(rule => (
          <RuleEditor key={rule.id} rule={rule} dealers={dealers} onSave={load} />
        ))
      )}
    </div>
  );
}
