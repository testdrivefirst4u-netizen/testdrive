"use client";
import { useState, useEffect } from "react";
import { Plus, Users, Phone, Mail, Loader2, X, Save, Eye, EyeOff, Trash2 } from "lucide-react";

export default function DealerTeamPage() {
  const [team,    setTeam]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ name:"", email:"", phone:"", password:"" });
  const [showPw,  setShowPw]  = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    // Filter only SALES_EXECUTIVE from the returned users
    const users = Array.isArray(data) ? data : [];
    setTeam(users.filter((u: any) => u.role === "SALES_EXECUTIVE"));
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required"); return;
    }
    setSaving(true); setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: "SALES_EXECUTIVE" }),
    });
    setSaving(false);
    if (!res.ok) { setError((await res.json()).error ?? "Failed to create"); return; }
    setModal(false);
    setForm({ name:"", email:"", phone:"", password:"" });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this executive?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Team</h1>
          <p className="text-sm text-gray-500 mt-0.5">{team.length} sales executives</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl">
          <Plus className="w-4 h-4" /> Add Executive
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : team.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No sales executives yet</p>
          <button onClick={() => setModal(true)} className="mt-3 text-indigo-600 text-sm font-semibold hover:underline">
            Add your first executive
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map(u => (
            <div key={u.id} className="bg-white border border-gray-100 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                    {u.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Active
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(u.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" />{u.email}</div>
                {u.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" />{u.phone}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Add Sales Executive</h2>
              <button onClick={() => { setModal(false); setError(""); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { k:"name",  l:"Full Name *",     type:"text",  ph:"John Doe"          },
                { k:"email", l:"Email Address *", type:"email", ph:"john@example.com"  },
                { k:"phone", l:"Phone",           type:"tel",   ph:"+91 98765 43210"   },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">{f.l}</label>
                  <input type={f.type}
                    value={(form as any)[f.k]}
                    onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                    placeholder={f.ph}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="Min 8 characters"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => { setModal(false); setError(""); }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">
                Cancel
              </button>
              <button onClick={handleCreate} disabled={saving}
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
