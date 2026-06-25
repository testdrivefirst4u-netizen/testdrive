"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Car, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

const CITIES = ["Hyderabad", "Mumbai", "Delhi", "Bengaluru", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat"];
const EMPTY = { name: "", email: "", phone: "", city: "", password: "", confirm: "", terms: false };

export default function RegisterPage() {
  const [show, setShow]     = useState(false);
  const [done, setDone]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm]     = useState<typeof EMPTY>(EMPTY);
  const [error, setError]   = useState("");

  function update(k: keyof typeof EMPTY, v: string | boolean) {
    setForm((p) => ({ ...p, [k]: v }));
    setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!form.terms) { setError("Please accept the terms to continue."); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone,
          city: form.city, password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); return; }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-500 text-sm mb-7">Welcome to Walley, {form.name.split(" ")[0]}. Your account is ready.</p>
          <Link href="/login"
            className="w-full h-12 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center">
            Sign In to Your Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-12">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Create Account</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-700/50 border border-blue-500/30 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold">Join Walley</h1>
              <p className="text-blue-200 text-xs">India&apos;s trusted automotive marketplace</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-8">
          <h2 className="font-bold text-gray-900 text-lg mb-6">Create your free account</h2>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input value={form.name} onChange={(e) => update("name", e.target.value)} required
                type="text" placeholder="Rahul Sharma"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input value={form.email} onChange={(e) => update("email", e.target.value)} required
                type="email" placeholder="rahul@example.com"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <input value={form.phone} onChange={(e) => update("phone", e.target.value)} required
                  type="tel" placeholder="+91 98765 43210"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">City</label>
                <select value={form.city} onChange={(e) => update("city", e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 outline-none text-sm bg-white appearance-none transition-all">
                  <option value="">Select city</option>
                  {CITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input value={form.password} onChange={(e) => update("password", e.target.value)} required
                  type={show ? "text" : "password"} placeholder="Min. 8 characters"
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <input value={form.confirm} onChange={(e) => update("confirm", e.target.value)} required
                type="password" placeholder="Re-enter password"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.terms} onChange={(e) => update("terms", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-700 accent-blue-700 cursor-pointer" />
              <span className="text-xs text-gray-500 leading-relaxed">
                I agree to Walley&apos;s{" "}
                <Link href="/terms" className="text-blue-600 hover:underline font-semibold">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline font-semibold">Privacy Policy</Link>
              </span>
            </label>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-12 bg-blue-700 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account…</> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          {["Free to Join", "No Spam", "Secure Data"].map((t) => (
            <div key={t} className="bg-white rounded-xl border border-gray-100 p-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto mb-1" />
              <p className="text-xs font-semibold text-gray-600">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
