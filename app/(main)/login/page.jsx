"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, Eye, EyeOff, Loader2, Lock, Mail, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rahul@example.com"
            autoComplete="email"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-700">Password</label>
          <span className="text-xs text-blue-600 hover:underline cursor-pointer">Forgot password?</span>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={show ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full h-11 pl-10 pr-11 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
          />
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
      )}

      <button type="submit" disabled={loading}
        className="w-full h-12 bg-blue-700 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing In…</> : "Sign In"}
      </button>

      <p className="text-center text-xs text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-blue-600 font-semibold hover:underline">Create one free</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-blue-700/50 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Car className="w-7 h-7 text-blue-200" />
          </div>
          <h1 className="text-2xl font-extrabold">Welcome back</h1>
          <p className="text-blue-200 text-sm mt-1">Sign in to your Walley account</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <Suspense fallback={<div className="h-48 animate-pulse bg-gray-50 rounded-xl" />}>
            <LoginForm />
          </Suspense>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          {["Secure Login", "No Spam", "Free Account"].map((t) => (
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
