"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

function ResetForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [error,    setError]    = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      setDone(true);
      setTimeout(() => router.push("/admin/login"), 2500);
    } finally { setLoading(false); }
  }

  if (!token) return (
    <div className="text-center space-y-3">
      <p className="text-sm text-red-500">Invalid reset link. Please request a new one.</p>
      <Link href="/admin/forgot-password" className="text-sm text-blue-600 hover:underline">Request new link</Link>
    </div>
  );

  return done ? (
    <div className="text-center space-y-4">
      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
      <h2 className="text-lg font-bold text-gray-900">Password updated!</h2>
      <p className="text-sm text-gray-500">Redirecting to login…</p>
    </div>
  ) : (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Set New Password</h2>
      <p className="text-sm text-gray-500 mb-6">Choose a strong password (min. 8 characters).</p>
      <form onSubmit={submit} className="space-y-4">
        {[
          { label: "New Password",     val: password, set: setPassword },
          { label: "Confirm Password", val: confirm,  set: setConfirm  },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"} required minLength={8}
                value={val} onChange={e => set(e.target.value)}
                className="w-full px-3 pr-10 h-10 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : "Update Password"}
        </button>
      </form>
    </>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Walley CMS</span>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" />}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
