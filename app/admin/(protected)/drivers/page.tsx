"use client";
import { useState, useEffect, useMemo } from "react";
import { Loader2, Mail, Phone, KeyRound, Eye, EyeOff, X, Building2 } from "lucide-react";
import { toast } from "sonner";

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  dealer: { id: string; name: string; code: string; brand: { name: string } } | null;
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [pwModal, setPwModal] = useState<Driver | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/drivers");
      const data = await res.json();
      setDrivers(Array.isArray(data.drivers) ? data.drivers : []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; brand: string; drivers: Driver[] }>();
    for (const d of drivers) {
      const key = d.dealer?.id ?? "unassigned";
      const label = d.dealer?.name ?? "No dealer assigned";
      const brand = d.dealer?.brand.name ?? "";
      if (!map.has(key)) map.set(key, { label, brand, drivers: [] });
      map.get(key)!.drivers.push(d);
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [drivers]);

  function openPasswordModal(driver: Driver) {
    setPwModal(driver);
    setNewPassword("");
    setShowNewPw(false);
    setPwError("");
  }

  async function handleSetPassword() {
    if (!pwModal) return;
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
    setPwError("");
    const res = await fetch(`/api/admin/drivers/${pwModal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setPwSaving(false);
    if (!res.ok) { setPwError((await res.json()).error ?? "Failed to set password"); return; }
    toast.success(`Password updated for ${pwModal.name}`);
    setPwModal(null);
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
        <p className="text-sm text-gray-500 mt-0.5">{drivers.length} drivers across all dealers</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-24 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
          No drivers found.
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-gray-400" />
                <h2 className="font-bold text-gray-800">{group.label}</h2>
                {group.brand && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{group.brand}</span>
                )}
                <span className="text-xs text-gray-400">{group.drivers.length} driver{group.drivers.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.drivers.map((d) => (
                  <div key={d.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-600 shrink-0">
                        {d.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{d.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {d.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-2 truncate"><Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />{d.email}</div>
                      {d.phone && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />{d.phone}</div>}
                    </div>
                    <button onClick={() => openPasswordModal(d)}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-colors">
                      <KeyRound className="w-3.5 h-3.5" /> Set Password
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {pwModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">Set Password — {pwModal.name}</h2>
              <button onClick={() => setPwModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500">
                Passwords are hashed and can't be viewed — only replaced. Share the new password with the driver directly.
              </p>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">New Password</label>
                <div className="relative">
                  <input type={showNewPw ? "text" : "password"} value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <button type="button" onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {pwError && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{pwError}</p>}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setPwModal(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl">
                Cancel
              </button>
              <button onClick={handleSetPassword} disabled={pwSaving}
                className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 disabled:opacity-50">
                {pwSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />} Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
