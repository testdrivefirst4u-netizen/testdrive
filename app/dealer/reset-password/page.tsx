"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, Loader2, CheckCircle2 } from "lucide-react";

function ResetForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
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
      setTimeout(() => router.push("/dealer/login"), 2500);
    } finally { setLoading(false); }
  }

  if (!token) return (
    <div className="text-center space-y-3">
      <p className="text-sm text-red-500">Invalid reset link.</p>
      <Link href="/dealer/forgot-password" className="text-sm text-indigo-600 hover:underline">Request new link</Link>
    </div>
  );

  return done ? (
    <div className="text-center space-y-4">
      <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
      <h2 className="text-lg font-bold text-gray-900">Password updated!</h2>
      <p className="text-sm text-gray-500">Redirecting to login…</p>
    </div>
  ) : (
    <form onSubmit={submit} className="space-y-4">
      {[
        { label: "New Password",     val: password, set: setPassword },
        { label: "Confirm Password", val: confirm,  set: setConfirm  },
      ].map(({ label, val, set }) => (
        <div key={label}>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">{label}</label>
          <input type="password" required minLength={8} value={val} onChange={e => set(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      ))}
      {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : "Update Password"}
      </button>
    </form>
  );
}

export default function DealerResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Car className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a strong password (min. 8 characters)</p>
        </div>
        <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" />}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
