"use client";
import { useState } from "react";
import Link from "next/link";
import { Car, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function AdminForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      setSent(true);
    } finally { setLoading(false); }
  }

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
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="text-lg font-bold text-gray-900">Check your email</h2>
              <p className="text-sm text-gray-500">
                If an account with <strong>{email}</strong> exists, we've sent a reset link.
                Check the server console if SMTP is not configured.
              </p>
              <Link href="/admin/login" className="block mt-4 text-sm text-blue-600 hover:underline">
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Forgot Password</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your email to receive a reset link.</p>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Email</label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3 h-10 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-sm"
                  />
                </div>
                {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send Reset Link"}
                </button>
              </form>
              <Link href="/admin/login" className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mt-4">
                <ArrowLeft className="w-3 h-3" /> Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
