"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Plus, Pencil, Trash2, X, Save, Loader2, Building2,
  Phone, Mail, MapPin, Star, AlertTriangle, ToggleLeft, ToggleRight,
  ChevronUp, ChevronDown, Eye, EyeOff, Link2, CheckCircle2, KeyRound, User,
} from "lucide-react";

interface Brand  { id: string; name: string }
interface Dealer {
  id: string; name: string; code: string; email: string; phone: string;
  managerName: string | null; managerPhone: string | null; address: string | null;
  city: string; state: string; priority: number; maxLeadsPerDay: number;
  todayLeadCount: number; status: string; isAvailable: boolean;
  brand: { id: string; name: string };
  adminUser?: { id: string; name: string; email: string } | null;
  crmWebhookUrl?: string | null;
  crmApiKey?: string | null;
  crmApiKeyType?: string | null;
}

const EMPTY_FORM = {
  name: "", code: "", brandId: "", email: "", phone: "",
  managerName: "", managerPhone: "", address: "", city: "", state: "",
  priority: "1", maxLeadsPerDay: "50", status: "ACTIVE",
  crmWebhookUrl: "", crmApiKey: "", crmApiKeyType: "bearer",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    "bg-emerald-100 text-emerald-700",
  INACTIVE:  "bg-gray-100 text-gray-500",
  SUSPENDED: "bg-red-100 text-red-600",
};

type CrmTestState = "idle" | "testing" | "ok" | "fail";

export default function AdminDealersPage() {
  const [dealers,    setDealers]    = useState<Dealer[]>([]);
  const [brands,     setBrands]     = useState<Brand[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState<"create" | "edit" | null>(null);
  const [editing,    setEditing]    = useState<Dealer | null>(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [deleting,   setDeleting]   = useState<string | null>(null);
  const [showCrmKey,    setShowCrmKey]    = useState(false);
  const [crmTest,       setCrmTest]       = useState<CrmTestState>("idle");
  const [crmTestMsg,    setCrmTestMsg]    = useState("");
  const [modalTab,      setModalTab]      = useState<"details" | "crm" | "login">("details");
  // Login credentials state (separate from main form — saved independently)
  const [loginName,     setLoginName]     = useState("");
  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw,   setShowLoginPw]   = useState(false);
  const [loginSaving,   setLoginSaving]   = useState(false);
  const [loginMsg,      setLoginMsg]      = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const p = filterBrand ? `?brandId=${filterBrand}` : "";
    const [dr, br] = await Promise.all([
      fetch(`/api/admin/dealers${p}`).then(r => r.json()),
      fetch("/api/brands").then(r => r.json()),
    ]);
    setDealers(dr.dealers ?? []);
    setBrands(Array.isArray(br) ? br : (br.brands ?? []));
    setLoading(false);
  }, [filterBrand]);

  useEffect(() => { load(); }, [load]);

  function resetLoginState() {
    setLoginName(""); setLoginEmail(""); setLoginPassword("");
    setShowLoginPw(false); setLoginMsg(null);
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setFormError("");
    setEditing(null);
    setModal("create");
    setShowCrmKey(false);
    setCrmTest("idle");
    setModalTab("details");
    resetLoginState();
  }

  function openEdit(d: Dealer) {
    setForm({
      name: d.name, code: d.code, brandId: d.brand.id,
      email: d.email, phone: d.phone,
      managerName: d.managerName ?? "", managerPhone: d.managerPhone ?? "",
      address: d.address ?? "", city: d.city, state: d.state,
      priority: String(d.priority), maxLeadsPerDay: String(d.maxLeadsPerDay),
      status: d.status,
      crmWebhookUrl: d.crmWebhookUrl ?? "",
      crmApiKey: d.crmApiKey ?? "",
      crmApiKeyType: d.crmApiKeyType ?? "bearer",
    });
    setFormError("");
    setEditing(d);
    setModal("edit");
    setShowCrmKey(false);
    setCrmTest("idle");
    setCrmTestMsg("");
    setModalTab("details");
    // Pre-fill login fields from linked user
    setLoginName(d.adminUser?.name   ?? "");
    setLoginEmail(d.adminUser?.email ?? "");
    setLoginPassword("");
    setShowLoginPw(false);
    setLoginMsg(null);
  }

  async function handleSave() {
    if (!form.name || !form.code || !form.brandId || !form.email || !form.phone || !form.city || !form.state) {
      setFormError("Name, code, brand, email, phone, city and state are required."); return;
    }
    setSaving(true); setFormError("");
    const url    = modal === "edit" ? `/api/admin/dealers/${editing!.id}` : "/api/admin/dealers";
    const method = modal === "edit" ? "PUT" : "POST";
    const res    = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) { setFormError((await res.json()).error ?? "Failed to save"); return; }
    setModal(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this dealer? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/admin/dealers/${id}`, { method: "DELETE" });
    setDeleting(null);
    load();
  }

  async function toggleAvailable(d: Dealer) {
    await fetch(`/api/admin/dealers/${d.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !d.isAvailable }),
    });
    load();
  }

  async function shiftPriority(d: Dealer, dir: "up" | "down") {
    const newPriority = dir === "up" ? Math.max(1, d.priority - 1) : d.priority + 1;
    await fetch(`/api/admin/dealers/${d.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority: newPriority }),
    });
    load();
  }

  async function saveLoginCredentials() {
    if (!editing || !loginEmail) { setLoginMsg({ type: "err", text: "Email is required" }); return; }
    setLoginSaving(true); setLoginMsg(null);
    const res = await fetch(`/api/admin/dealers/${editing.id}/credentials`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginEmail, loginPassword: loginPassword || undefined, loginName: loginName || undefined }),
    });
    const data = await res.json();
    setLoginSaving(false);
    if (res.ok) {
      setLoginMsg({ type: "ok", text: "Credentials updated successfully" });
      setLoginPassword("");
      load();
    } else {
      setLoginMsg({ type: "err", text: data.error ?? "Failed to update credentials" });
    }
  }

  async function testCrm() {
    if (!form.crmWebhookUrl) { setCrmTestMsg("Enter a webhook URL first"); setCrmTest("fail"); return; }
    setCrmTest("testing"); setCrmTestMsg("");
    try {
      const res = await fetch("/api/admin/dealers/crm-test", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl: form.crmWebhookUrl,
          apiKey:     form.crmApiKey     || undefined,
          apiKeyType: form.crmApiKeyType || "bearer",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCrmTest("ok"); setCrmTestMsg(`Connected · HTTP ${data.status}`);
      } else {
        setCrmTest("fail"); setCrmTestMsg(data.error ?? "Connection failed");
      }
    } catch (e: any) {
      setCrmTest("fail"); setCrmTestMsg(e.message ?? "Network error");
    }
  }

  const f = (k: keyof typeof EMPTY_FORM, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dealers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dealers.length} dealer{dealers.length !== 1 ? "s" : ""} · leads auto-assigned by priority</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add Dealer
        </button>
      </div>

      {/* Brand filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilterBrand("")}
          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${!filterBrand ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
          All Brands
        </button>
        {brands.map(b => (
          <button key={b.id} onClick={() => setFilterBrand(filterBrand === b.id ? "" : b.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${filterBrand === b.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
            {b.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : dealers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No dealers yet</p>
            <button onClick={openCreate} className="mt-3 text-blue-600 text-sm font-semibold hover:underline">Add your first dealer</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dealer</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Brand</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Leads Today</th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Available</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dealers.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-900">{d.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{d.code}</p>
                      {d.city && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" />{d.city}, {d.state}
                        </p>
                      )}
                      {d.crmWebhookUrl && (
                        <p className="text-[10px] text-emerald-600 flex items-center gap-1 mt-0.5">
                          <Link2 className="w-2.5 h-2.5" /> CRM connected
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">{d.brand.name}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <a href={`tel:${d.phone}`} className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600">
                        <Phone className="w-3 h-3" />{d.phone}
                      </a>
                      <a href={`mailto:${d.email}`} className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 mt-0.5 truncate max-w-[180px]">
                        <Mail className="w-3 h-3" />{d.email}
                      </a>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => shiftPriority(d, "up")} className="text-gray-300 hover:text-gray-600">
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => shiftPriority(d, "down")} className="text-gray-300 hover:text-gray-600">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
                          <span className="text-sm font-black text-amber-600">{d.priority}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-center">
                      <span className={`text-xs font-bold ${d.todayLeadCount >= d.maxLeadsPerDay ? "text-red-600" : "text-gray-700"}`}>
                        {d.todayLeadCount}/{d.maxLeadsPerDay}
                      </span>
                      {d.todayLeadCount >= d.maxLeadsPerDay && (
                        <p className="text-[9px] text-red-500 flex items-center justify-center gap-0.5 mt-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> Cap reached
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={() => toggleAvailable(d)}>
                        {d.isAvailable
                          ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                          : <ToggleLeft  className="w-6 h-6 text-gray-300"    />}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[d.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(d)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(d.id)} disabled={deleting === d.id}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-40">
                          {deleting === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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

      {/* Priority legend */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <Star className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
          <div className="text-xs text-blue-700 space-y-1">
            <p className="font-bold">Lead Assignment Rules</p>
            <p>• Leads are auto-assigned when submitted from the website</p>
            <p>• <strong>Priority 1</strong> dealers receive leads first. If at daily cap, the next dealer in priority order is used</p>
            <p>• Dealers with the <strong>same priority</strong> are assigned round-robin (oldest last-assigned gets the next lead)</p>
            <p>• Toggling <strong>Available</strong> instantly pauses/resumes a dealer receiving leads</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="font-bold text-gray-900">{modal === "create" ? "Add New Dealer" : `Edit — ${editing?.name}`}</h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs — only in edit mode */}
            {modal === "edit" && (
              <div className="flex border-b border-gray-100 shrink-0 px-6">
                <button
                  onClick={() => setModalTab("details")}
                  className={`py-3 px-1 mr-6 text-sm font-bold border-b-2 transition-colors ${modalTab === "details" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  Details
                </button>
                <button
                  onClick={() => setModalTab("crm")}
                  className={`py-3 px-1 mr-6 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${modalTab === "crm" ? "border-violet-600 text-violet-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  CRM
                  {form.crmWebhookUrl && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  )}
                </button>
                <button
                  onClick={() => setModalTab("login")}
                  className={`py-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${modalTab === "login" ? "border-orange-500 text-orange-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Login
                </button>
              </div>
            )}

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* ── Details tab ── */}
              {(modal === "create" || modalTab === "details") && (<>

              {/* Section: Identity */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dealer Identity</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { k: "name",  l: "Dealer Name *",    ph: "Hyundai Showroom Hyd" },
                  { k: "code",  l: "Dealer Code *",    ph: "HYD-HYD-001" },
                ].map(({ k, l, ph }) => (
                  <div key={k}>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">{l}</label>
                    <input value={(form as any)[k]} onChange={e => f(k as any, e.target.value)} placeholder={ph}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Brand *</label>
                  <select value={form.brandId} onChange={e => f("brandId", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Select brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Status</label>
                  <select value={form.status} onChange={e => f("status", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              {/* Section: Contact */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2">Contact Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { k: "email",        l: "Email *",          ph: "dealer@example.com",  type: "email" },
                  { k: "phone",        l: "Phone *",          ph: "+91 98765 43210",     type: "tel"   },
                  { k: "managerName",  l: "Manager Name",     ph: "Rajesh Kumar",        type: "text"  },
                  { k: "managerPhone", l: "Manager Phone",    ph: "+91 98765 43210",     type: "tel"   },
                ].map(({ k, l, ph, type }) => (
                  <div key={k}>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">{l}</label>
                    <input type={type} value={(form as any)[k]} onChange={e => f(k as any, e.target.value)} placeholder={ph}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
              </div>

              {/* Section: Location */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2">Location</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { k: "city",    l: "City *",    ph: "Hyderabad" },
                  { k: "state",   l: "State *",   ph: "Telangana" },
                  { k: "address", l: "Address",   ph: "123 Main St, Banjara Hills" },
                ].map(({ k, l, ph }) => (
                  <div key={k} className={k === "address" ? "sm:col-span-2" : ""}>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">{l}</label>
                    <input value={(form as any)[k]} onChange={e => f(k as any, e.target.value)} placeholder={ph}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
              </div>

              {/* Section: Lead Assignment */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2">Lead Assignment</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Priority <span className="text-gray-400">(1 = highest)</span></label>
                  <input type="number" min="1" value={form.priority} onChange={e => f("priority", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">Max Leads / Day</label>
                  <input type="number" min="1" value={form.maxLeadsPerDay} onChange={e => f("maxLeadsPerDay", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {formError && (
                <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{formError}</p>
              )}
              </>)}

              {/* ── CRM tab (edit only) ── */}
              {modal === "edit" && modalTab === "crm" && (
                <>
                  <div className="pt-0 flex items-center gap-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CRM Integration</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 font-bold">Optional</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                    <p className="text-xs text-gray-500">
                      When a lead is assigned to this dealer, it will automatically be pushed to their CRM via webhook.
                    </p>

                    {/* Webhook URL */}
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                        <Link2 className="w-3 h-3" /> Webhook URL
                      </label>
                      <input
                        value={form.crmWebhookUrl}
                        onChange={e => { f("crmWebhookUrl", e.target.value); setCrmTest("idle"); }}
                        placeholder="https://crm.example.com/api/leads"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                      />
                    </div>

                    {/* Auth method + API key */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">Auth Method</label>
                        <select
                          value={form.crmApiKeyType}
                          onChange={e => f("crmApiKeyType", e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                        >
                          <option value="bearer">Bearer Token</option>
                          <option value="x-api-key">X-API-Key Header</option>
                          <option value="query">Query Param (api_key=…)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">API Key / Token</label>
                        <div className="relative">
                          <input
                            type={showCrmKey ? "text" : "password"}
                            value={form.crmApiKey}
                            onChange={e => f("crmApiKey", e.target.value)}
                            placeholder="sk-…"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCrmKey(s => !s)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCrmKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Test button */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={testCrm}
                        disabled={crmTest === "testing"}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white transition-colors"
                      >
                        {crmTest === "testing"
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Testing…</>
                          : <><Link2 className="w-3.5 h-3.5" /> Test Connection</>
                        }
                      </button>
                      {crmTest === "ok" && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" /> {crmTestMsg}
                        </span>
                      )}
                      {crmTest === "fail" && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                          <AlertTriangle className="w-4 h-4" /> {crmTestMsg}
                        </span>
                      )}
                    </div>

                    {/* Payload preview */}
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-400 hover:text-gray-600 font-semibold select-none">
                        View payload format
                      </summary>
                      <pre className="mt-2 bg-gray-900 text-green-400 rounded-xl p-3 overflow-x-auto text-[11px] leading-relaxed">{JSON.stringify({
                        id: "lead_abc123", name: "Customer Name", mobile: "9876543210",
                        email: "customer@email.com", city: "Hyderabad", vehicleName: "Hyundai Creta",
                        source: "website", status: "new",
                        createdAt: new Date().toISOString(), origin: "testdrivefirst",
                      }, null, 2)}</pre>
                    </details>
                  </div>
                </>
              )}

              {/* ── Login tab (edit only) ── */}
              {modal === "edit" && modalTab === "login" && (
                <div className="space-y-4">
                  {editing?.adminUser ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-700">{editing.adminUser.name || "—"}</p>
                          <p className="text-[11px] text-gray-500">{editing.adminUser.email}</p>
                        </div>
                        <span className="ml-auto text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">DEALER_ADMIN</span>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">Display Name</label>
                        <input
                          value={loginName}
                          onChange={e => setLoginName(e.target.value)}
                          placeholder="Dealer manager name"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">Login Email <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          placeholder="dealer@example.com"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                          New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showLoginPw ? "text" : "password"}
                            value={loginPassword}
                            onChange={e => setLoginPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                          <button type="button" onClick={() => setShowLoginPw(s => !s)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showLoginPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {loginMsg && (
                        <p className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl ${loginMsg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                          {loginMsg.type === "ok" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          {loginMsg.text}
                        </p>
                      )}

                      <button
                        onClick={saveLoginCredentials}
                        disabled={loginSaving}
                        className="w-full h-10 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        {loginSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><KeyRound className="w-4 h-4" /> Update Login Credentials</>}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <KeyRound className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No login account linked</p>
                      <p className="text-xs mt-1">This dealer has no portal login account yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">
                Cancel
              </button>
              {modalTab !== "login" && (
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 disabled:opacity-50">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {modal === "create" ? "Create Dealer" : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
