"use client";
import { useActionState } from "react";
import { Loader2, Car, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { dealerLoginAction } from "./actions";
import { useState } from "react";

export default function DealerLoginPage() {
  const [state, formAction, isPending] = useActionState(dealerLoginAction, null);
  const [show, setShow] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Car className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Dealer Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your dealership account</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Email Address</label>
            <input
              type="email" name="email" required autoComplete="email"
              placeholder="you@dealership.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"} name="password" required autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {state?.error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{state.error}</p>
          )}

          <button type="submit" disabled={isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors mt-2">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Signing in…" : "Sign In"}
          </button>

          <div className="text-center">
            <Link href="/dealer/forgot-password" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
